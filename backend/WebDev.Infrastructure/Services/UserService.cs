using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.AspNetCore.Identity;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;

public sealed class UserService : IUserService
{
    private readonly PasswordHasher<InMemoryUser> _passwordHasher = new();
    private readonly ConcurrentDictionary<string, InMemoryUser> _usersByEmail;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public UserService()
    {
        _usersByEmail = SeedUsers();
    }

    public Task<UserDto?> ValidateCredentialsAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return Task.FromResult<UserDto?>(null);
        }

        var normalizedEmail = NormalizeEmail(email);

        if (!_usersByEmail.TryGetValue(normalizedEmail, out var user))
        {
            return Task.FromResult<UserDto?>(null);
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Task.FromResult<UserDto?>(null);
        }

        var dto = MapToDto(user);
        return Task.FromResult<UserDto?>(dto);
    }

    public async Task<(bool Success, IEnumerable<string> Errors)> CreateUserAsync(RegisterRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var normalizedEmail = NormalizeEmail(request.Email);

        await _lock.WaitAsync();
        try
        {
            if (_usersByEmail.ContainsKey(normalizedEmail))
            {
                return (false, new[] { "Email is already registered." });
            }

            var role = request.Role ?? UserRole.Member;

            var user = new InMemoryUser
            {
                Id = Guid.NewGuid().ToString("N"),
                Email = normalizedEmail,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Role = role
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            if (!_usersByEmail.TryAdd(normalizedEmail, user))
            {
                return (false, new[] { "Email is already registered." });
            }

            return (true, Array.Empty<string>());
        }
        finally
        {
            _lock.Release();
        }
    }

    private static ConcurrentDictionary<string, InMemoryUser> SeedUsers()
    {
        var users = new ConcurrentDictionary<string, InMemoryUser>(StringComparer.OrdinalIgnoreCase);
        var passwordHasher = new PasswordHasher<InMemoryUser>();

        var demoUser = new InMemoryUser
        {
            Id = Guid.NewGuid().ToString("N"),
            Email = NormalizeEmail("demo@company.com"),
            FirstName = "Demo",
            LastName = "User",
            Role = UserRole.Member
        };
        demoUser.PasswordHash = passwordHasher.HashPassword(demoUser, "123456");
        users.TryAdd(demoUser.Email, demoUser);

        var adminUser = new InMemoryUser
        {
            Id = Guid.NewGuid().ToString("N"),
            Email = NormalizeEmail("admin@company.com"),
            FirstName = "Admin",
            LastName = "User",
            Role = UserRole.Admin
        };
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "password123");
        users.TryAdd(adminUser.Email, adminUser);

        return users;
    }

    private static UserDto MapToDto(InMemoryUser user)
    {
        var displayName = $"{user.FirstName} {user.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(displayName))
        {
            displayName = user.Email;
        }

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = displayName,
            Role = user.Role
        };
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private sealed class InMemoryUser
    {
        public required string Id { get; init; }
        public required string Email { get; init; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required UserRole Role { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
    }
}
