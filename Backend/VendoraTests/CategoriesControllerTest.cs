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
    public class CategoriesControllerTest
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

        private void SetupAdminUser(CategoriesController controller)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        #region GetCategory Tesztek
        [Fact]
        public async Task GetCategories_MindenKategoriatVisszaad()
        {
            var db = GetDatabaseContext();
            db.Categories.AddRange(
                new Category { Id = 1, Name = "Elektronika", Slug = "elektronika" },
                new Category { Id = 2, Name = "Ruházat", Slug = "ruházat" }
            );
            await db.SaveChangesAsync();
            var controller = new CategoriesController(db);

            var result = await controller.GetCategories();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var categories = Assert.IsType<List<Category>>(okResult.Value);
            Assert.Equal(2, categories.Count);
        }

        [Fact]
        public async Task GetCategory_Hiba_KategoriaNemTalalhato()
        {
            var db = GetDatabaseContext();
            var controller = new CategoriesController(db);

            var result = await controller.GetCategory(999);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Kategória nem található.", notFoundResult.Value);
        }
        #endregion

        #region CreateCategory Tesztek
        [Fact]
        public async Task CreateCategory_SikeresLetrehozas()
        {
            var db = GetDatabaseContext();
            var controller = new CategoriesController(db);
            SetupAdminUser(controller);
            var dto = new CategoryCreateDTO { Name = "Új Kategória" };

            var result = await controller.CreateCategory(dto);

            Assert.IsType<OkObjectResult>(result);
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Name == "Új Kategória");
            Assert.NotNull(category);
            Assert.Equal("új-kategória", category.Slug);
        }
        #endregion

        #region DeleteCategory Tesztek
        [Fact]
        public async Task DeleteCategory_SikeresTorles()
        {
            var db = GetDatabaseContext();
            var category = new Category { Id = 1, Name = "Törlendő", Slug = "torlendo" };
            db.Categories.Add(category);
            await db.SaveChangesAsync();

            var controller = new CategoriesController(db);
            SetupAdminUser(controller);

            var result = await controller.DeleteCategory(1);

            Assert.IsType<OkObjectResult>(result);
            Assert.Empty(db.Categories);
        }

        [Fact]
        public async Task DeleteCategory_Hiba_VannakBenneTermekek()
        {
            var db = GetDatabaseContext();
            var category = new Category { Id = 5, Name = "Nem Törölhető", Slug = "nem-torolheto" };
            db.Categories.Add(category);

            db.Products.Add(new Product { Id = 1, Name = "Teszt Termék", CategoryId = 5, Description = "...", Price = 10 });
            await db.SaveChangesAsync();

            var controller = new CategoriesController(db);
            SetupAdminUser(controller);

            var result = await controller.DeleteCategory(5);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Nem törölhető a kategória, amíg termékek tartoznak hozzá!", badRequestResult.Value);
        }
        #endregion
    }
}