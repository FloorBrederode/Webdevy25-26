using Microsoft.EntityFrameworkCore;
using WebDev.Infrastructure.Data;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;
public class PaymentService : IPaymentService
{
    private readonly WebDevDbContext _context;

    public PaymentService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
    {
        return await _context.Payments.ToListAsync();
    }
}