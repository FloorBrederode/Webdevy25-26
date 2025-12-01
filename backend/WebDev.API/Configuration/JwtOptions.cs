namespace WebDev.API.Configuration;


public sealed class JwtOptions
{
    public string Issuer { get; init; } =  "Team 1";
    public string Key { get; init; } = string.Empty;
    public long AccessTokenLifetimeSeconds { get; init; } = 84000;
}
