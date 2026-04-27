using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VendoraAPI.Model
{
    [Table("support_tickets")]
    public class SupportTicket
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("question")]
        public string Question { get; set; } = null!;

        [Column("answer")]
        public string? Answer { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}