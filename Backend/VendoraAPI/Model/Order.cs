using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System;

namespace VendoraAPI.Model
{
    [Table("orders")]
    public class Order
    {
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("order_date")]
        public DateTime OrderDate { get; set; }

        [Column("status")]
        public OrderStatus Status { get; set; }

        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "Bankkártya";

        [Column("shipping_address")]
        public string ShippingAddress { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;
        public virtual User? User { get; set; }
        public List<OrderItem> OrderItems { get; set; }
    }

public enum OrderStatus { Pending, Paid, Shipped, Delivered, Cancelled }
}