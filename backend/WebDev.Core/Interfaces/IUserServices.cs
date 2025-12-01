namespace WebDev.Core.Interfaces;

using WebDev.Core.DTOs;

public interface IUserService
{
    Task<UserDto?> ValidateCredentialsAsync(string email, string password);
    Task<(bool Success, IEnumerable<string> Errors)> CreateUserAsync(RegisterRequestDto request);
    // Task<UserProfileDto?> GetProfileAsync(string userId);
}