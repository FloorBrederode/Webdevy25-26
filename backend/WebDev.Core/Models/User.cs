namespace WebDev.Core.Models;

public enum UserRole
{
    Staff = 0,
    Manager = 1,
    Admin = 2
}

public sealed class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public required string PasswordHash { get; set; }
    public string? JobTitle { get; set; }
    public UserRole Role { get; set; } = UserRole.Staff;
    public int? CompanyId { get; set; }
    public Company? Company { get; set; }
}
