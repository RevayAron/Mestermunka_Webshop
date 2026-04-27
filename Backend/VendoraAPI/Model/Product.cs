using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VendoraAPI.Model
{
    [Table("products")]
    public class Product
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("stock_quantity")]
        public int StockQuantity { get; set; }

        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_approved")]
        public bool IsApproved { get; set; } = false;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        public virtual Category? Category { get; set; }
        public virtual User? User { get; set; }
    }
}