using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using VendoraAPI.Controllers;
using VendoraAPI.Data;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using Xunit;

namespace VendoraTests
{
    public class ProductsControllerTest
    {
        private ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var dbContext = new ApplicationDbContext(options);
            dbContext.Database.EnsureCreated();
            return dbContext;
        }

        private void SetupUser(ProductsController controller, string userId = null, string role = "User")
        {
            var claims = new List<Claim>();
            if (userId != null)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
                claims.Add(new Claim("id", userId));
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var identity = new ClaimsIdentity(claims, userId != null ? "TestAuth" : null);
            var principal = new ClaimsPrincipal(identity);

            var httpContext = new DefaultHttpContext { User = principal };

            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new HostString("localhost:7211");

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        #region UploadImage Tesztek
        [Fact]
        public async Task UploadImage_SikeresFeltoltes()
        {
            var db = GetDatabaseContext();
            var controller = new ProductsController(db);
            SetupUser(controller, "1", "Vendor");

            // Moq használata a fájl szimulálására
            var fileMock = new Mock<IFormFile>();
            var content = "Fake image content";
            var fileName = "tesztkep.jpg";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            fileMock.Setup(_ => _.OpenReadStream()).Returns(ms);
            fileMock.Setup(_ => _.FileName).Returns(fileName);
            fileMock.Setup(_ => _.Length).Returns(ms.Length);

            var result = await controller.UploadImage(fileMock.Object);

            var okResult = Assert.IsType<OkObjectResult>(result);

            var resultValue = okResult.Value;
            var imageUrlProperty = resultValue.GetType().GetProperty("ImageUrl");
            var imageUrl = (string)imageUrlProperty.GetValue(resultValue, null);

            Assert.Contains("tesztkep.jpg", imageUrl);
            Assert.StartsWith("https://localhost:7211/uploads/", imageUrl);
        }

        [Fact]
        public async Task UploadImage_Hiba_NincsFajlKivalasztva()
        {
            var db = GetDatabaseContext();
            var controller = new ProductsController(db);
            SetupUser(controller, "1", "Vendor");

            var result = await controller.UploadImage(null);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Nincs fájl kiválasztva.", badRequest.Value);
        }
        #endregion

        #region GetProducts / GetProduct Tesztek
        [Fact]
        public async Task GetProducts_CsakJovahagyottEsNemToroltTermekeketAdVissza()
        {
            var db = GetDatabaseContext();

            db.Categories.Add(new Category { Id = 1, Name = "Teszt Kategória", Slug = "teszt" });

            db.Products.Add(new Product { Id = 1, Name = "Látható", Description = "...", Price = 100, CategoryId = 1, IsApproved = true, IsDeleted = false });
            db.Products.Add(new Product { Id = 2, Name = "Rejtett (Torolt)", Description = "...", Price = 100, CategoryId = 1, IsApproved = true, IsDeleted = true });
            db.Products.Add(new Product { Id = 3, Name = "Rejtett (Nincs jovahagyva)", Description = "...", Price = 100, CategoryId = 1, IsApproved = false, IsDeleted = false });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);

            var result = await controller.GetProducts(null, null, null);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var products = (IEnumerable<dynamic>)okResult.Value;
            Assert.Single(products); // Csak az 1-es ID-jú maradhat
        }

        [Fact]
        public async Task GetProduct_Hiba_TermekNemTalalhatoVagyNincsJovahagyva()
        {
            var db = GetDatabaseContext();
            db.Products.Add(new Product { Id = 1, Name = "Rejtett", Description = "...", Price = 100, IsApproved = false });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);

            var result = await controller.GetProduct(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }
        #endregion

        #region CreateProduct Tesztek
        [Fact]
        public async Task CreateProduct_SikeresFeltoltes_AlapbolNincsJovahagyva()
        {
            var db = GetDatabaseContext();
            var controller = new ProductsController(db);
            SetupUser(controller, "1", "Vendor");

            var dto = new ProductCreateDTO { Name = "Új cipő", Description = "Szép", Price = 5000, CategoryId = 1, StockQuantity = 10 };

            var result = await controller.CreateProduct(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var product = await db.Products.FirstAsync();

            Assert.Equal("Új cipő", product.Name);
            Assert.False(product.IsApproved); // Alapból false-nak kell lennie
            Assert.False(product.IsDeleted);
        }
        #endregion

        #region UpdateProduct Tesztek
        [Fact]
        public async Task UpdateProduct_SikeresFrissitesSajatTermeknel()
        {
            var db = GetDatabaseContext();
            var vendorId = 5;

            db.Categories.Add(new Category { Id = 1, Name = "Kategória", Slug = "kat" });
            db.Products.Add(new Product { Id = 1, Name = "Régi név", Description = "...", Price = 100, CategoryId = 1, UserId = vendorId });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);
            SetupUser(controller, vendorId.ToString(), "Vendor");

            var dto = new ProductCreateDTO { Name = "Új név", Description = "...", Price = 100, CategoryId = 1 };

            var result = await controller.UpdateProduct(1, dto);

            Assert.IsType<OkObjectResult>(result);
            var updatedProduct = await db.Products.FindAsync(1);
            Assert.Equal("Új név", updatedProduct.Name);
        }

        [Fact]
        public async Task UpdateProduct_Hiba_MasVendorTermeke()
        {
            var db = GetDatabaseContext();
            db.Products.Add(new Product { Id = 1, Name = "Másé", Description = "...", Price = 100, UserId = 99 });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);
            SetupUser(controller, "1", "Vendor"); // 1-es id akarja a 99-esét módosítani

            var dto = new ProductCreateDTO { Name = "Hekk", Description = "...", Price = 10 };

            var result = await controller.UpdateProduct(1, dto);

            Assert.IsType<ForbidResult>(result);
        }
        #endregion

        #region Dashboard & Admin Tesztek
        [Fact]
        public async Task ApproveProduct_AdminSikeresenJovahagyja()
        {
            var db = GetDatabaseContext();
            db.Products.Add(new Product { Id = 1, Name = "Várakozó", Description = "...", Price = 10, IsApproved = false });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);
            SetupUser(controller, "1", "Admin");

            var result = await controller.ApproveProduct(1);

            Assert.IsType<OkObjectResult>(result);
            var product = await db.Products.FindAsync(1);
            Assert.True(product.IsApproved);
        }

        [Fact]
        public async Task DeleteProduct_SoftDeleteKorrektulMukodik()
        {
            var db = GetDatabaseContext();
            var vendorId = 10;
            db.Products.Add(new Product { Id = 1, Name = "Törlendő", Description = "...", Price = 10, UserId = vendorId, IsApproved = true, IsDeleted = false });
            await db.SaveChangesAsync();

            var controller = new ProductsController(db);
            SetupUser(controller, vendorId.ToString(), "Vendor");

            var result = await controller.DeleteProduct(1);

            Assert.IsType<OkObjectResult>(result);
            var product = await db.Products.FindAsync(1);
            Assert.True(product.IsDeleted); // Törölve lett
            Assert.False(product.IsApproved); // És a jóváhagyás is lekerült róla
        }
        #endregion
    }
}