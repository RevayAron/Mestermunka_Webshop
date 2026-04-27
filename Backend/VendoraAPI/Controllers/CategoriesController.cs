using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using VendoraAPI.Data;

namespace VendoraAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Kategória nem található.");
            return Ok(category);
        }

        [Authorize(Roles = "Admin")] //Csak az Admin szerepkörű felhasználók hozhatnak létre kategóriát
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDTO dto)
        {
            var slug = dto.Name.ToLower().Replace(" ", "-");

            var category = new Category
            {
                Name = dto.Name,
                Slug = string.IsNullOrEmpty(dto.Slug) ? slug : dto.Slug,
                ParentId = null
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kategória sikeresen létrehozva!", Id = category.Id });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryCreateDTO dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Kategória nem található.");

            category.Name = dto.Name;
            category.Slug = string.IsNullOrEmpty(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Kategória frissítve!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Kategória nem található.");

            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest("Nem törölhető a kategória, amíg termékek tartoznak hozzá!");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kategória sikeresen törölve!" });
        }
    }
}