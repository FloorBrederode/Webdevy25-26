using System.ComponentModel.DataAnnotations;
using WebDev.Core.Models;

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
    public required string Name { get; init; }
    public required DateTime ExpiresAt { get; init; }
    public required UserRole Role { get; init; }
    public required string Token { get; init; }
}

public sealed class RegisterRequestDto
{
    [Required]
    public required string Name { get; init; }

    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    [DataType(DataType.Password)]
    [MinLength(6)]
    public required string Password { get; init; }

    public string? PhoneNumber { get; init; }
    public string? JobTitle { get; init; }
    public int? CompanyId { get; init; }
    public UserRole? Role { get; init; }
}

public sealed class RegisterResponseDto
{
    public required string ID { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public string? PhoneNumber { get; init; }
    public string? JobTitle { get; init; }
    public int? CompanyId { get; init; }
    public required UserRole Role { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
}
