using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using VendoraAPI.Data;


namespace VendoraAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public OrdersController(ApplicationDbContext context) => _context = context;

        private int? GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
            return userIdString != null ? int.Parse(userIdString) : null;
        }

        [Authorize(Roles = "Admin, Vendor")]
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");

            var query = _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                .Where(oi => !oi.Order.IsDeleted);

            if (!isAdmin)
            {
                query = query.Where(oi => oi.Product.UserId == userId);
            }

            var items = await query.ToListAsync();

            decimal totalRevenue = items
                .Where(i => i.Status != OrderStatus.Cancelled)
                .Sum(i => i.Quantity * i.PriceAtPurchase);

            int totalSales = items
                .Where(i => i.Status != OrderStatus.Cancelled)
                .Sum(i => i.Quantity);

            int pendingOrders = items
                .Count(i => i.Status == OrderStatus.Pending);

            int activeProducts = 0;
            if (isAdmin)
            {
                activeProducts = await _context.Products.CountAsync(p => !p.IsDeleted);
            }
            else
            {
                activeProducts = await _context.Products.CountAsync(p => p.UserId == userId && !p.IsDeleted);
            }

            return Ok(new
            {
                totalRevenue,
                totalSales,
                pendingOrders,
                activeProducts
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PostOrder([FromBody] OrderCreateDTO orderDto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var cartItems = await _context.CartItems
                    .Include(c => c.Product)
                    .Where(c => c.CustomerId == userId)
                    .ToListAsync();

                if (!cartItems.Any()) return BadRequest(new { Message = "Üres a kosarad!" });

                string payment = orderDto.PaymentMethod ?? "Utánvét";
                string paymentLower = payment.ToLower();

                bool isPaidInstantly = paymentLower.Contains("bankkártya") ||
                                       paymentLower.Contains("kártya") ||
                                       paymentLower.Contains("előreutalás") ||
                                       paymentLower.Contains("utalás");

                var startingStatus = isPaidInstantly ? OrderStatus.Paid : OrderStatus.Pending;

                var newOrder = new Order
                {
                    UserId = userId.Value,
                    TotalAmount = cartItems.Sum(i => i.Product.Price * i.Quantity),
                    ShippingAddress = orderDto.ShippingAddress,
                    PaymentMethod = payment,
                    OrderDate = DateTime.Now,
                    Status = startingStatus,
                    OrderItems = new List<OrderItem>(),
                    IsDeleted = false
                };

                foreach (var item in cartItems)
                {
                    newOrder.OrderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        PriceAtPurchase = item.Product.Price,
                        Status = startingStatus
                    });
                }

                _context.Orders.Add(newOrder);
                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Sikeres rendelés!", OrderId = newOrder.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdString = User.FindFirstValue("id") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var myOrders = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .Where(o => o.UserId == userId && !o.IsDeleted)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new {
                    id = o.Id.ToString(),
                    date = o.OrderDate,
                    total = o.TotalAmount,
                    status = o.Status.ToString(),
                    shippingAddress = o.ShippingAddress,
                    paymentMethod = o.PaymentMethod,
                    items = o.OrderItems.Select(oi => new {
                        name = oi.Product.Name,
                        quantity = oi.Quantity,
                        price = oi.PriceAtPurchase,
                        status = oi.Status.ToString(),
                        img = oi.Product.ImageUrl ?? "https://via.placeholder.com/150"
                    })
                })
                .ToListAsync();

            return Ok(myOrders);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all-orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Where(o => !o.IsDeleted)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var result = orders.Select(o => new {
                id = o.Id,
                userId = o.UserId,
                userName = o.User != null ? (!string.IsNullOrEmpty(o.User.CompanyName) ? o.User.CompanyName : $"{o.User.FirstName} {o.User.LastName}".Trim()) : "Ismeretlen",
                orderDate = o.OrderDate,
                totalAmount = o.TotalAmount,
                status = o.Status.ToString(),
                shippingAddress = o.ShippingAddress,
                paymentMethod = o.PaymentMethod,
                items = o.OrderItems.Select(oi => new {
                    itemId = oi.Id,
                    name = oi.Product.Name,
                    quantity = oi.Quantity,
                    price = oi.PriceAtPurchase,
                    status = oi.Status.ToString(),
                    img = oi.Product.ImageUrl ?? "https://via.placeholder.com/150"
                })
            });

            return Ok(result);
        }

        [Authorize(Roles = "Admin, Vendor")]
        [HttpGet("vendor-orders")]
        public async Task<IActionResult> GetVendorOrders()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var vendorItems = await _context.OrderItems
                .Include(oi => oi.Order).ThenInclude(o => o.User)
                .Include(oi => oi.Product)
                .Where(oi => oi.Product.UserId == userId && !oi.Order.IsDeleted)
                .OrderByDescending(oi => oi.Order.OrderDate)
                .Select(oi => new {
                    itemId = oi.Id,
                    orderId = oi.OrderId,
                    productId = oi.ProductId,
                    productName = oi.Product.Name,
                    productImage = oi.Product.ImageUrl,
                    quantity = oi.Quantity,
                    paidAmount = oi.Quantity * oi.PriceAtPurchase,
                    userName = oi.Order.User != null ? (!string.IsNullOrEmpty(oi.Order.User.CompanyName) ? oi.Order.User.CompanyName : $"{oi.Order.User.FirstName} {oi.Order.User.LastName}".Trim()) : "Ismeretlen",
                    orderDate = oi.Order.OrderDate,
                    shippingAddress = oi.Order.ShippingAddress,

                    paymentMethod = oi.Order.PaymentMethod,

                    status = oi.Status.ToString()
                })
                .ToListAsync();

            return Ok(vendorItems);
        }

        [Authorize(Roles = "Admin, Vendor")]
        [HttpPatch("item/{itemId}/status")]
        public async Task<IActionResult> UpdateOrderItemStatus(int itemId, [FromBody] string newStatus)
        {
            var item = await _context.OrderItems
                .Include(oi => oi.Product)
                .FirstOrDefaultAsync(oi => oi.Id == itemId);

            if (item == null) return NotFound("Tétel nem található.");

            bool isAdmin = User.IsInRole("Admin");
            var userId = GetUserId();

            if (!isAdmin && item.Product.UserId != userId) return Forbid();

            if (Enum.TryParse<OrderStatus>(newStatus, true, out var parsedStatus))
            {
                item.Status = parsedStatus;

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == item.OrderId);

                if (order != null)
                {
                    bool allSameStatus = order.OrderItems.All(oi => oi.Status == parsedStatus);
                    if (allSameStatus)
                    {
                        order.Status = parsedStatus;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Tétel státusza sikeresen frissítve, rendelés szinkronizálva!" });
            }

            return BadRequest("Érvénytelen státusz!");
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string newStatus)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null || order.IsDeleted) return NotFound("Rendelés nem található.");

            if (Enum.TryParse<OrderStatus>(newStatus, true, out var parsedStatus))
            {
                order.Status = parsedStatus;
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Sikeres frissítés!" });
            }

            return BadRequest("Érvénytelen státusz!");
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var userId = GetUserId();
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (order == null) return NotFound();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin && order.UserId != userId) return Forbid();

            return Ok(order);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.IsDeleted) return NotFound(new { Message = "Rendelés nem található." });

            order.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Rendelés sikeresen törölve." });
        }
    }
}