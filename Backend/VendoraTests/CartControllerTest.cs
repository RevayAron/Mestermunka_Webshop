using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendoraAPI.Controllers;
using VendoraAPI.Data;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using Xunit;

namespace VendoraTests
{
    public class CartControllerTests
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

        private void SetupUser(CartController controller, string userId = null)
        {
            var claims = new List<Claim>();
            if (userId != null)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
                claims.Add(new Claim("id", userId));
            }

            var identity = new ClaimsIdentity(claims, userId != null ? "TestAuth" : null);
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        #region GetCart Tesztek
        [Fact]
        public async Task GetCart_KosarbanVannakTermekek()
        {
            var db = GetDatabaseContext();
            var product = new Product { Id = 10, Name = "Laptop", Price = 100, Description = "Teszt", StockQuantity = 5 };
            db.Products.Add(product);
            db.CartItems.Add(new CartItem { CustomerId = 1, ProductId = 10, Quantity = 2 });
            await db.SaveChangesAsync();

            var controller = new CartController(db);
            SetupUser(controller, "1");

            var result = await controller.GetCart();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var items = Assert.IsType<List<CartItem>>(okResult.Value);
            Assert.Single(items);
        }

        [Fact]
        public async Task GetCart_NincsBejelentkezve()
        {
            var db = GetDatabaseContext();
            var controller = new CartController(db);
            SetupUser(controller, null);

            var result = await controller.GetCart();

            Assert.IsType<UnauthorizedResult>(result);
        }
        #endregion

        #region AddToCart Tesztek
        [Fact]
        public async Task AddToCart_UjTermekHozzaadasa()
        {
            var db = GetDatabaseContext();
            var controller = new CartController(db);
            SetupUser(controller, "1");
            var dto = new AddToCartDTO { ProductId = 5, Quantity = 1 };

            var result = await controller.AddToCart(dto);

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, await db.CartItems.CountAsync());
        }

        [Fact]
        public async Task AddToCart_Hiba_NincsBejelentkezve()
        {
            var db = GetDatabaseContext();
            var controller = new CartController(db);
            SetupUser(controller, null);
            var dto = new AddToCartDTO { ProductId = 5, Quantity = 1 };

            var result = await controller.AddToCart(dto);

            Assert.IsType<UnauthorizedResult>(result);
        }
        #endregion

        #region UpdateQuantity Tesztek
        [Fact]
        public async Task UpdateQuantity_MennyisegModositasa()
        {
            var db = GetDatabaseContext();
            db.CartItems.Add(new CartItem { CustomerId = 1, ProductId = 5, Quantity = 1 });
            await db.SaveChangesAsync();

            var controller = new CartController(db);
            SetupUser(controller, "1");
            var dto = new AddToCartDTO { ProductId = 5, Quantity = 10 };

            var result = await controller.UpdateQuantity(dto);

            Assert.IsType<OkObjectResult>(result);
            var item = await db.CartItems.FirstAsync();
            Assert.Equal(10, item.Quantity);
        }

        [Fact]
        public async Task UpdateQuantity_Hiba_TermekNincsAKosarban()
        {
            var db = GetDatabaseContext();
            var controller = new CartController(db);
            SetupUser(controller, "1");
            var dto = new AddToCartDTO { ProductId = 999, Quantity = 1 };

            var result = await controller.UpdateQuantity(dto);

            Assert.IsType<NotFoundObjectResult>(result);
        }
        #endregion

        #region Remove Tesztek
        [Fact]
        public async Task Remove_TermekTorlese()
        {
            var db = GetDatabaseContext();
            db.CartItems.Add(new CartItem { CustomerId = 1, ProductId = 100 });
            await db.SaveChangesAsync();

            var controller = new CartController(db);
            SetupUser(controller, "1");

            var result = await controller.Remove(100);

            Assert.IsType<OkObjectResult>(result);
            Assert.Empty(db.CartItems);
        }

        [Fact]
        public async Task Remove_Hiba_RosszProductId()
        {
            var db = GetDatabaseContext();
            var controller = new CartController(db);
            SetupUser(controller, "1");

            var result = await controller.Remove(999);

            Assert.IsType<NotFoundResult>(result);
        }
        #endregion
    }
}