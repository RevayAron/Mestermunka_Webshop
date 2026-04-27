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
    public class OrdersControllerTests
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

        private void SetupUser(OrdersController controller, string userId = null, string role = "User")
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

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        #region PostOrder Tesztek
        [Fact]
        public async Task PostOrder_SikeresRendelesBankkartyaval()
        {
            var db = GetDatabaseContext();
            var userId = 1;

            var product = new Product { Id = 1, Name = "Teszt termék", Description = "Teszt leírás", Price = 1000 };
            db.Products.Add(product);
            db.CartItems.Add(new CartItem { CustomerId = userId, ProductId = 1, Quantity = 1 });
            await db.SaveChangesAsync();

            var controller = new OrdersController(db);
            SetupUser(controller, userId.ToString());

            var dto = new OrderCreateDTO
            {
                ShippingAddress = "Budapest, Fő utca 1.",
                PaymentMethod = "Bankkártya"
            };

            var result = await controller.PostOrder(dto);

            Assert.IsType<OkObjectResult>(result);
            var order = await db.Orders.FirstAsync();
            Assert.Equal(OrderStatus.Paid, order.Status);
        }
        #endregion

        #region GetMyOrders Tesztek
        [Fact]
        public async Task GetMyOrders_SajatRendelesekLekerese()
        {
            var db = GetDatabaseContext();
            var userId = 1;

            db.Orders.Add(new Order
            {
                Id = 1,
                UserId = userId,
                TotalAmount = 5000,
                OrderDate = DateTime.Now,
                Status = OrderStatus.Pending,
                ShippingAddress = "Próba utca 1."
            });
            await db.SaveChangesAsync();

            var controller = new OrdersController(db);
            SetupUser(controller, userId.ToString());

            var result = await controller.GetMyOrders();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var orders = (IEnumerable<dynamic>)okResult.Value;
            Assert.Single(orders);
        }

        [Fact]
        public async Task GetMyOrders_NincsBejelentkezve()
        {
            var db = GetDatabaseContext();
            var controller = new OrdersController(db);
            SetupUser(controller, null); 

            var result = await controller.GetMyOrders();

            Assert.IsType<UnauthorizedResult>(result);
        }
        #endregion

        #region UpdateOrderItemStatus Tesztek
        [Fact]
        public async Task UpdateOrderItemStatus_SikeresFrissites()
        {
            var db = GetDatabaseContext();
            var vendorId = 10;

            var order = new Order { Id = 1, Status = OrderStatus.Pending, ShippingAddress = "Vevő címe" };
            var product = new Product { Id = 1, Name = "Laptop", Description = "Szép", UserId = vendorId };
            var item = new OrderItem { Id = 1, OrderId = 1, ProductId = 1, Status = OrderStatus.Pending, Quantity = 1 };

            db.Orders.Add(order);
            db.Products.Add(product);
            db.OrderItems.Add(item);
            await db.SaveChangesAsync();

            var controller = new OrdersController(db);
            SetupUser(controller, vendorId.ToString(), "Vendor");

            var result = await controller.UpdateOrderItemStatus(1, "Shipped");

            Assert.IsType<OkObjectResult>(result);
            var updatedOrder = await db.Orders.FindAsync(1);
            Assert.Equal(OrderStatus.Shipped, updatedOrder.Status);
        }

        [Fact]
        public async Task UpdateOrderItemStatus_Hiba_NemSajatTermek()
        {
            var db = GetDatabaseContext();
            var vendorId = 10;
            var productOfOtherVendor = new Product { Id = 1, Name = "Másé", Description = "Másé", UserId = 99 };
            var item = new OrderItem { Id = 1, ProductId = 1, Status = OrderStatus.Pending };

            db.Products.Add(productOfOtherVendor);
            db.OrderItems.Add(item);
            await db.SaveChangesAsync();

            var controller = new OrdersController(db);
            SetupUser(controller, vendorId.ToString(), "Vendor");

            var result = await controller.UpdateOrderItemStatus(1, "Shipped");

            Assert.IsType<ForbidResult>(result);
        }
        #endregion

        #region DeleteOrder Tesztek
        [Fact]
        public async Task DeleteOrder_AdminSikeresenTorli()
        {
            var db = GetDatabaseContext();
            db.Orders.Add(new Order { Id = 1, IsDeleted = false, ShippingAddress = "Budapest" });
            await db.SaveChangesAsync();

            var controller = new OrdersController(db);
            SetupUser(controller, "1", "Admin");

            var result = await controller.DeleteOrder(1);

            Assert.IsType<OkObjectResult>(result);
            var order = await db.Orders.FindAsync(1);
            Assert.True(order.IsDeleted);
        }
        #endregion
    }
}