using System.Threading.Tasks;

namespace WebDev.Core.Interfaces;

public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody);
}
