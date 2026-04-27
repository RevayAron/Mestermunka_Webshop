using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;
using VendoraAPI.Controllers;
using VendoraAPI.Data;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using Xunit;

namespace VendoraTests
{
    public class UsersControllerTest
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

        private IConfiguration GetTestConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"Jwt:Key", "EzEgyNagyonHosszuTitkosKulcsASzemuveghez123!"}, 
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
        }

        private void SetupUser(UsersController controller, string userId = null, string role = "Customer")
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

        #region Register Tesztek
        [Fact]
        public async Task Register_SikeresVasaraloRegisztracio()
        {
            var db = GetDatabaseContext();
            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);

            var dto = new RegisterDTO { Email = "teszt@teszt.hu", Password = "Password123!", FirstName = "Gizi" };

            var result = await controller.Register(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var user = await db.Users.FirstAsync();

            Assert.Equal("teszt@teszt.hu", user.Email);
            Assert.Equal(UserStatus.Active, user.Status);
            Assert.Equal(UserRole.Customer, user.Role);
        }

        [Fact]
        public async Task Register_Hiba_EmailMarFoglalt()
        {
            var db = GetDatabaseContext();
            db.Users.Add(new User { UserId = 1, Email = "foglalt@teszt.hu", PasswordHash = "...", FirstName = "Béla", LastName = "Kovács" });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            var dto = new RegisterDTO { Email = "foglalt@teszt.hu", Password = "123", FirstName = "Béla" };

            var result = await controller.Register(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        }
        #endregion

        #region Login Tesztek
        [Fact]
        public async Task Login_SikeresBejelentkezes_TokentAdVissza()
        {
            var db = GetDatabaseContext();
            var password = "TitkosJelszo123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            db.Users.Add(new User
            {
                UserId = 1,
                Email = "login@teszt.hu",
                PasswordHash = hashedPassword,
                Status = UserStatus.Active,
                FirstName = "Admin",
                LastName = "User",
                IsDeleted = false
            });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            var dto = new LoginDTO { Email = "login@teszt.hu", Password = password };

            var result = await controller.Login(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;
            var tokenProperty = value.GetType().GetProperty("Token");
            Assert.NotNull(tokenProperty.GetValue(value, null));
        }

        [Fact]
        public async Task Login_Hiba_HibasJelszo()
        {
            var db = GetDatabaseContext();
            db.Users.Add(new User { UserId = 1, Email = "login@teszt.hu", PasswordHash = BCrypt.Net.BCrypt.HashPassword("JoJelszo"), FirstName = "X", LastName = "Y" });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            var dto = new LoginDTO { Email = "login@teszt.hu", Password = "RosszJelszo" };

            var result = await controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }
        #endregion

        #region UploadAvatar Tesztek
        [Fact]
        public async Task UploadAvatar_SikeresFeltoltes_FrissitiAUserAdatbazist()
        {
            var db = GetDatabaseContext();
            db.Users.Add(new User { UserId = 1, Email = "a@a.hu", FirstName = "A", LastName = "B", PasswordHash = "kamuhash" });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            SetupUser(controller, "1");

            var fileMock = new Mock<IFormFile>();
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write("Fake image content");
            writer.Flush();
            ms.Position = 0;

            fileMock.Setup(_ => _.OpenReadStream()).Returns(ms);
            fileMock.Setup(_ => _.FileName).Returns("avatar.png");
            fileMock.Setup(_ => _.Length).Returns(ms.Length);

            var result = await controller.UploadAvatar(fileMock.Object);

            Assert.IsType<OkObjectResult>(result);
            var user = await db.Users.FindAsync(1);

            Assert.EndsWith(".png", user.ImageUrl);

            Assert.Contains("avatar_1_", user.ImageUrl);
        }
        #endregion

        #region DeleteUser Tesztek
        [Fact]
        public async Task DeleteUser_SikeresSoftDeleteEsKosarUrites()
        {
            var db = GetDatabaseContext();
            var userId = 5;
            db.Users.Add(new User { UserId = userId, Email = "del@del.hu", IsDeleted = false, FirstName = "A", LastName = "B", PasswordHash = "kamuhash" });
            db.CartItems.Add(new CartItem { Id = 1, CustomerId = userId, ProductId = 1, Quantity = 1 });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            SetupUser(controller, userId.ToString(), "Customer");

            var result = await controller.DeleteUser(userId);

            Assert.IsType<OkObjectResult>(result);
            var user = await db.Users.FindAsync(userId);
            Assert.True(user.IsDeleted);
            Assert.Equal(UserStatus.Suspended, user.Status);
            Assert.Empty(db.CartItems);
        }

        [Fact]
        public async Task DeleteUser_Hiba_NincsJogosultsagMasProfiljatTorolni()
        {
            var db = GetDatabaseContext();
            db.Users.Add(new User { UserId = 99, Email = "mas@mas.hu", FirstName = "A", LastName = "B", PasswordHash = "kamuhash" });
            await db.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new UsersController(db, config);
            SetupUser(controller, "1", "Customer");

            var result = await controller.DeleteUser(99);

            var forbidResult = Assert.IsType<ForbidResult>(result);
        }

        
        #endregion
    }
}