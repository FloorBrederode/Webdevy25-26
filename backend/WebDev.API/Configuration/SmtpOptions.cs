namespace WebDev.API.Configuration;

public sealed class SmtpOptions
{
    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string FromEmail { get; set; } = "webdev@webdev.com";
    public string FromName { get; set; } = "WebDev";
}
