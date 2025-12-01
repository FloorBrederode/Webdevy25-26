namespace WebDev.Core.Interfaces;

using WebDev.Core.DTOs;

public interface IUserService
{
    Task<UserDto?> ValidateCredentialsAsync(string email, string password);
    Task<(bool Success, IEnumerable<string> Errors)> CreateUserAsync(RegisterRequestDto request);
    Task<UserDto?> FindByEmailAsync(string email);
    Task<bool> UpdatePasswordAsync(string userId, string newPassword);
    // Task<UserProfileDto?> GetProfileAsync(string userId);
}
