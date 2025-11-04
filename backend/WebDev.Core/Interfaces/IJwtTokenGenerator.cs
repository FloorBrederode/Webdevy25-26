namespace WebDev.Core.Interfaces;

using WebDev.Core.DTOs;

public interface IJwtTokenGenerator
{
    string GenerateToken(UserDto user);
    long AccessTokenLifetimeSeconds { get; }
}