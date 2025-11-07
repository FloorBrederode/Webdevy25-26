using WebDev.Core.Models;

namespace WebDev.Core.DTOs;

public sealed class UserDto
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public UserRole Role { get; init; } = UserRole.Staff;
    public string? PhoneNumber { get; init; }
    public string? JobTitle { get; init; }
    public int? CompanyId { get; init; }
    public string? CompanyName { get; init; }
}
