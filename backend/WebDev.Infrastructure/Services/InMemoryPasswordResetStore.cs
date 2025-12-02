using System;
using System.Collections.Concurrent;
using WebDev.Core.Interfaces;

namespace WebDev.Infrastructure.Services;

public sealed class InMemoryPasswordResetStore : IPasswordResetStore
{
    private readonly ConcurrentDictionary<string, PasswordResetEntry> _tokens = new();
    private readonly Random _rng = new();

    public string CreateToken(string userId, TimeSpan lifetime)
    {
        var token = GenerateToken();
        var entry = new PasswordResetEntry
        {
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.Add(lifetime)
        };

        _tokens[token] = entry;
        return token;
    }

    public string? ConsumeToken(string token)
    {
        if (!_tokens.TryRemove(token, out var entry))
        {
            return null;
        }

        if (entry.ExpiresAt <= DateTime.UtcNow)
        {
            return null;
        }

        return entry.UserId;
    }

    private string GenerateToken()
    {
        // Simple base64 token for demonstration;
        var buffer = new byte[32];
        _rng.NextBytes(buffer);
        return Convert.ToBase64String(buffer)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private sealed class PasswordResetEntry
    {
        public required string UserId { get; init; }
        public DateTime ExpiresAt { get; init; }
    }
}
