using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using VendoraAPI.Data;


namespace VendoraAPI.Controllers
{
    // Segéd DTO az Admin szerkesztéshez
    public class AdminUserUpdateDTO
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? CompanyName { get; set; }
        public string? Role { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { Message = "Ez az email cím már foglalt!" });

            bool isVendor = (!string.IsNullOrEmpty(dto.Role) && dto.Role.ToLower() == "vendor") ||
                            !string.IsNullOrEmpty(dto.CompanyName);

            var newUser = new User
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CompanyName = dto.CompanyName,
                TaxNumber = dto.TaxNumber,
                Role = isVendor ? UserRole.Vendor : UserRole.Customer,
                Status = isVendor ? UserStatus.Pending : UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            string responseMessage = isVendor
                ? "Regisztráció fogadva! A céges fiókod adminisztrátori jóváhagyásra vár."
                : "Sikeres regisztráció!";

            return Ok(new { Message = responseMessage });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            //csak azokat keressük amelyek nincsenek "törölve"
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && !u.IsDeleted);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { Message = "Hibás email cím vagy jelszó!" });

            if (user.Status == UserStatus.Pending)
                return Unauthorized(new { Message = "A fiókod regisztrációját még nem hagyta jóvá egy adminisztrátor! Kérjük, légy türelemmel." });

            if (user.Status == UserStatus.Suspended)
                return Unauthorized(new { Message = "A fiókod fel lett függesztve!" });

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim("id", user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                Message = "Sikeres bejelentkezés!",
                Token = tokenString,
                User = new { user.UserId, user.Email, user.FirstName, Role = user.Role.ToString() }
            });
        }

        [Authorize]
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Nincs fájl kiválasztva.");

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
            if (userIdString == null) return Unauthorized();
            int userId = int.Parse(userIdString);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Felhasználó nem található.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_avatars");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"avatar_{userId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;

            user.ImageUrl = $"{request.Scheme}://{request.Host}/user_avatars/{fileName}";

            await _context.SaveChangesAsync();

            return Ok(new { ImageUrl = user.ImageUrl });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-vendors")]
        public async Task<IActionResult> GetPendingVendors()
        {
            var pending = await _context.Users
                .Where(u => u.Role == UserRole.Vendor && u.Status == UserStatus.Pending && !u.IsDeleted)
                .Select(u => new { u.UserId, u.Email, u.CompanyName, u.TaxNumber, u.Phone, u.CreatedAt })
                .ToListAsync();

            return Ok(pending);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("approve-vendor/{id}")]
        public async Task<IActionResult> ApproveVendor(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted) return NotFound("Felhasználó nem található.");

            user.Status = UserStatus.Active;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Eladó sikeresen jóváhagyva!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("reject-vendor/{id}")]
        public async Task<IActionResult> RejectVendor(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted) return NotFound("Felhasználó nem található.");

            user.IsDeleted = true;
            user.Status = UserStatus.Suspended;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Eladó regisztrációja elutasítva és törölve." });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
            if (userIdString == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null) return NotFound();

            return Ok(new
            {
                user.UserId,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Role,
                user.CompanyName,
                imageUrl = user.ImageUrl
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => !u.IsDeleted) //Csak azok akik nincsenek törölve
                .Select(u => new {
                    u.UserId,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.CompanyName,
                    Role = u.Role.ToString(),
                    Status = u.Status.ToString(),
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id"));
            var user = await _context.Users.FindAsync(userId);

            if (user == null || user.IsDeleted) return NotFound();

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.CompanyName = dto.CompanyName ?? user.CompanyName;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Profil sikeresen frissítve!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin-update/{id}")]
        public async Task<IActionResult> AdminUpdateUser(int id, [FromBody] AdminUserUpdateDTO dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted) return NotFound("Felhasználó nem található.");

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.CompanyName = dto.CompanyName ?? user.CompanyName;

            if (!string.IsNullOrEmpty(dto.Role) && Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole))
            {
                user.Role = parsedRole;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Fiók sikeresen frissítve!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted) return NotFound("Felhasználó nem található.");

            if (user.Role.ToString() == "Admin")
                return BadRequest("Admin fiókot nem lehet módosítani.");

            if (user.Status.ToString() == "Active") user.Status = UserStatus.Pending;
            else user.Status = UserStatus.Active;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Státusz sikeresen frissítve!", newStatus = user.Status.ToString() });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id"));
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && currentUserId != id) return Forbid("Nincs jogosultságod más profiljának törléséhez!");

            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted) return NotFound();

            user.IsDeleted = true;
            user.Status = UserStatus.Suspended;

            //Kosár kiürítése
            var cartItems = _context.CartItems.Where(c => c.CustomerId == id);
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Felhasználói fiók sikeresen törölve!" });
        }

        [HttpGet("vendors")]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _context.Users
                .Where(u => (u.Role == UserRole.Vendor || (int)u.Role == 1) && !u.IsDeleted)
                .Select(u => new
                {
                    u.UserId,
                    Name = !string.IsNullOrEmpty(u.CompanyName) ? u.CompanyName : (u.FirstName + " " + u.LastName),
                    u.Phone,
                    u.Email
                })
                .ToListAsync();

            return Ok(vendors);
        }
    }
}