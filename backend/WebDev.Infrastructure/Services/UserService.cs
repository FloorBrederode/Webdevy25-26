using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using BCryptNet = BCrypt.Net.BCrypt;
using Microsoft.EntityFrameworkCore;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Infrastructure.Data;

namespace WebDev.Infrastructure.Services;

public sealed class UserService : IUserService
{
    private readonly WebDevDbContext _context;

    public UserService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto?> ValidateCredentialsAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        var normalizedEmail = NormalizeEmail(email);

        var user = await _context.Users
            .Include(u => u.Company)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user is null)
        {
            return null;
        }

        var passwordVerified = BCryptNet.Verify(password, user.PasswordHash);
        if (!passwordVerified)
        {
            return null;
        }

        return MapToDto(user);
    }

    public async Task<(bool Success, IEnumerable<string> Errors)> CreateUserAsync(RegisterRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var normalizedEmail = NormalizeEmail(request.Email);

        var emailExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

        if (emailExists)
        {
            return (false, new[] { "Email is already registered." });
        }

        if (request.CompanyId.HasValue)
        {
            var companyExists = await _context.Companies
                .AsNoTracking()
                .AnyAsync(c => c.Id == request.CompanyId.Value);

            if (!companyExists)
            {
                return (false, new[] { "Company does not exist." });
            }
        }

        var role = request.Role ?? UserRole.Staff;

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            JobTitle = string.IsNullOrWhiteSpace(request.JobTitle) ? null : request.JobTitle.Trim(),
            CompanyId = request.CompanyId,
            Role = role,
            PasswordHash = BCryptNet.HashPassword(request.Password, workFactor: 12)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<UserDto?> FindByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var normalizedEmail = NormalizeEmail(email);

        var user = await _context.Users
            .Include(u => u.Company)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        return user is null ? null : MapToDto(user);
    }

    public async Task<bool> UpdatePasswordAsync(string userId, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(newPassword))
        {
            return false;
        }

        if (!int.TryParse(userId, out var parsedId))
        {
            return false;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == parsedId);
        if (user is null)
        {
            return false;
        }

        user.PasswordHash = BCryptNet.HashPassword(newPassword, workFactor: 12);
        await _context.SaveChangesAsync();
        return true;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id.ToString(CultureInfo.InvariantCulture),
        Email = user.Email,
        Name = user.Name,
        Role = user.Role,
        PhoneNumber = user.PhoneNumber,
        JobTitle = user.JobTitle,
        CompanyId = user.CompanyId,
        CompanyName = user.Company?.Name
    };

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Company)
            .AsNoTracking()
            .ToListAsync();

        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            userDtos.Add(MapToDto(user));
        }

        return userDtos;
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Company)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user is null ? null : MapToDto(user);
    }

    public async Task<bool> UpdateNameAsync(int userId, string newName)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return false;
        }

        user.Name = newName.Trim();
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateEmailAsync(int userId, string newEmail)
    {
        var normalizedEmail = NormalizeEmail(newEmail);

        var emailExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail && u.Id != userId);

        if (emailExists)
        {
            return false;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return false;
        }

        user.Email = normalizedEmail;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdatePasswordAsync(int userId, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return false;
        }

        user.PasswordHash = BCryptNet.HashPassword(newPassword, workFactor: 12);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    
}
