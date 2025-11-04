namespace WebDev.Core.DTOs;

public sealed class UserDto
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public string? Role { get; init; }
    public string? DisplayName { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
