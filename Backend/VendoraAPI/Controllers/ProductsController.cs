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
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Vendor, Admin")]
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Nincs fájl kiválasztva.");

            //Mappák megkeresése és létrehozása
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            //Fájl név generálása (egyedi)
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            //Fájl lementése a szerverre
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            //Vissza küldjük az URL-t a reactnek
            var request = HttpContext.Request;
            var fullUrl = $"{request.Scheme}://{request.Host}/uploads/{uniqueFileName}";

            return Ok(new { ImageUrl = fullUrl });
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] int? categoryId, [FromQuery] decimal? maxPrice)
        {
            var query = _context.Products.Include(p => p.Category).Where(p => p.IsApproved && !p.IsDeleted).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search)) query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
            if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId.Value);
            if (maxPrice.HasValue) query = query.Where(p => p.Price <= maxPrice.Value);

            var products = await query.ToListAsync();

            var result = products.Select(p => new {
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : "Nincs kategória"
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id && p.IsApproved && !p.IsDeleted);
            if (product == null) return NotFound("Termék nem található, nincs jóváhagyva, vagy törölve lett.");

            return Ok(new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.ImageUrl,
                CategoryName = product.Category?.Name
            });
        }

        [Authorize(Roles = "Vendor, Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDTO dto)
        {
            var UserIdString = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? HttpContext.User.FindFirstValue("id");
            if (UserIdString == null) return Unauthorized("Nem található felhasználó a tokenben.");

            int vendorId = int.Parse(UserIdString);

            var newProduct = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                UserId = vendorId,
                CategoryId = (int)dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                IsApproved = false,
                IsDeleted = false
            };

            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Termék sikeresen feltöltve! Megjelenés előtt egy Adminnak jóvá kell hagynia.", ProductId = newProduct.Id });
        }

        [Authorize(Roles = "Vendor, Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateDTO dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound("Termék nem található vagy törölve lett.");

            var userId = int.Parse(HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            bool isAdmin = User.IsInRole("Admin");

            if (!isAdmin && product.UserId != userId) return Forbid();

            product.Name = dto.Name; product.Description = dto.Description; product.Price = dto.Price;
            product.StockQuantity = dto.StockQuantity; product.CategoryId = (int)dto.CategoryId; product.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Termék sikeresen frissítve!" });
        }

        [Authorize(Roles = "Admin, Vendor")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardProducts()
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            bool isAdmin = userRole == "Admin";

            var query = _context.Products.Include(p => p.User).Include(p => p.Category).Where(p => !p.IsDeleted).AsQueryable();

            if (!isAdmin)
            {
                var userIdString = User.FindFirstValue("id") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
                int userId = int.TryParse(userIdString, out int parsedId) ? parsedId : 0;
                query = query.Where(p => p.UserId == userId);
            }

            var products = await query.OrderByDescending(p => p.Id).ToListAsync();

            var result = products.Select(p => new {
                id = p.Id,
                name = p.Name,
                description = p.Description,
                price = p.Price,
                stockQuantity = p.StockQuantity,
                imageUrl = p.ImageUrl,
                isApproved = p.IsApproved,
                categoryId = p.CategoryId,
                categoryName = p.Category?.Name ?? "Ismeretlen",
                userId = p.UserId,
                userName = p.User != null ? (!string.IsNullOrEmpty(p.User.CompanyName) ? p.User.CompanyName : $"{p.User.FirstName} {p.User.LastName}".Trim()) : "Ismeretlen"
            });

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingProducts()
        {
            var pending = await _context.Products.Where(p => !p.IsApproved && !p.IsDeleted).ToListAsync();
            return Ok(pending);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound(new { Message = "Termék nem található vagy törölve lett." });

            product.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Termék sikeresen jóváhagyva!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleProductStatus(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound(new { Message = "Termék nem található vagy törölve lett." });

            product.IsApproved = !product.IsApproved;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Termék állapota frissítve!", IsApproved = product.IsApproved });
        }

        [Authorize(Roles = "Admin, Vendor")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound(new { Message = "Termék nem található vagy már törölve lett." });

            var userIdString = User.FindFirstValue("id") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            int userId = int.TryParse(userIdString, out int parsedId) ? parsedId : 0;
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            bool isAdmin = userRole == "Admin";

            if (!isAdmin && product.UserId != userId) return StatusCode(403, new { Message = "Nincs jogosultságod más termékét törölni!" });

            try
            {
                product.IsDeleted = true;
                product.IsApproved = false;
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Termék sikeresen eltávolítva (Soft Delete)!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Hiba történt a törlés során!", ErrorDetail = ex.Message });
            }
        }
    }
}