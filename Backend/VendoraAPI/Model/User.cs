using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VendoraAPI.Model
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("email")]
        public string Email { get; set; } = null!;

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = null!;

        [Column("image_url")]
        public string? ImageUrl { get; set; } 

        [Column("role")]
        public UserRole Role { get; set; } = UserRole.Customer;

        [Column("status")]
        public UserStatus Status { get; set; } = UserStatus.Active;

        //Vevő adatok
        [Column("first_name")]
        public string? FirstName { get; set; }

        [Column("last_name")]
        public string? LastName { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        //Céges adatok
        [Column("company_name")]
        public string? CompanyName { get; set; }

        [Column("tax_number")]
        public string? TaxNumber { get; set; }

        [Column("bank_account")]
        public string? BankAccount { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public enum UserRole { Admin, Vendor, Customer }
    public enum UserStatus { Pending, Active, Suspended }
}