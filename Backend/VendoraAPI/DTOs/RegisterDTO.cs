namespace VendoraAPI.DTOs
{
    public class RegisterDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Phone { get; set; }

        public bool IsVendor { get; set; }

        public string? Role { get; set; }
        public string? CompanyName { get; set; }
        public string? TaxNumber { get; set; }
        public string? BankAccount { get; set; }
    }
}