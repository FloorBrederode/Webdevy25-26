using System.ComponentModel.DataAnnotations;

namespace WebDev.Core.DTOs;

public sealed class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }
}

public sealed class LoginResponseDto
{
    public required string ID { get; init; }
    public required string Username { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public required string Role { get; init; }
    public required string Token { get; init; }
}

public sealed class RegisterRequestDto
{
    [Required]
    public required string FirstName { get; init; }

    [Required]
    public required string LastName { get; init; }

    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    [DataType(DataType.Password)]
    [MinLength(6)]
    public required string Password { get; init; }

    public string? Role { get; init; }
}

public sealed class RegisterResponseDto
{
    public required string ID { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string DisplayName { get; init; }
    public required string Role { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
}
