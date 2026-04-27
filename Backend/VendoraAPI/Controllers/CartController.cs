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
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CartController(ApplicationDbContext context) => _context = context;

        //User Id kinyerése
        private int? GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
            return userIdString != null ? int.Parse(userIdString) : null;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var items = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.CustomerId == userId)
                .ToListAsync();

            return Ok(items);
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDTO dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var item = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.CustomerId == userId && c.ProductId == dto.ProductId);

                if (item != null)
                {
                    item.Quantity += dto.Quantity;
                }
                else
                {
                    _context.CartItems.Add(new CartItem
                    {
                        CustomerId = userId.Value,
                        ProductId = dto.ProductId,
                        Quantity = dto.Quantity
                    });
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Kosárba került!" });
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [Authorize]
        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateQuantity([FromBody] AddToCartDTO dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var item = await _context.CartItems
                .FirstOrDefaultAsync(c => c.CustomerId == userId && c.ProductId == dto.ProductId);

            if (item == null) return NotFound("A termék nincs a kosárban.");

            item.Quantity = dto.Quantity;

            if (item.Quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Mennyiség frissítve" });
        }

        [Authorize]
        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var item = await _context.CartItems
                .FirstOrDefaultAsync(c => c.CustomerId == userId && c.ProductId == productId);

            if (item == null) return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Törölve" });
        }

        [Authorize]
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var items = await _context.CartItems.Where(c => c.CustomerId == userId).ToListAsync();
            _context.CartItems.RemoveRange(items);

            await _context.SaveChangesAsync();
            return Ok(new { Message = "A kosár kiürítve" });
        }
    }
}