using System;

namespace WebDev.Core.Interfaces;

public interface IPasswordResetStore
{
    string CreateToken(string userId, TimeSpan lifetime);
    /// <summary>
    /// Consume and invalidate a token. Returns the user id if valid; otherwise null.
    /// </summary>
    string? ConsumeToken(string token);
}
