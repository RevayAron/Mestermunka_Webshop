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
    public class SupportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SupportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("faq")]
        public async Task<IActionResult> GetFaq()
        {
            var faqs = await _context.SupportTickets
                .Where(t => t.Status == "Answered")
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(faqs);
        }

        [Authorize]
        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] SupportQuestionDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest(new { Message = "A kérdés nem lehet üres!" });

            var ticket = new SupportTicket
            {
                Question = dto.Question,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kérdés sikeresen beküldve!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _context.SupportTickets
                .OrderBy(t => t.Status == "Answered")
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tickets);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/answer")]
        public async Task<IActionResult> AnswerTicket(int id, [FromBody] SupportAnswerDTO dto)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound("Kérdés nem található.");

            ticket.Answer = dto.Answer;
            ticket.Status = "Answered"; //Már publikusan látszódik

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Válasz sikeresen elmentve!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound("Kérdés nem található.");

            _context.SupportTickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kérdés törölve!" });
        }
    }
}