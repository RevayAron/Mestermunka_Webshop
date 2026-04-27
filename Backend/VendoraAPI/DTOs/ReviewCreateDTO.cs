namespace VendoraAPI.DTOs
{
    public class ReviewCreateDTO
    {
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }
}