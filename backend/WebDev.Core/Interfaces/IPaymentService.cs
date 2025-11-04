using WebDev.Core.Models;


namespace WebDev.Core.Interfaces;
public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAllPaymentsAsync();
}