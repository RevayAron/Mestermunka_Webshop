public class UserDTO
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? FullName => $"{FirstName} {LastName}";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CompanyName { get; set; } //Csak ha vendor
}