using Microsoft.EntityFrameworkCore;
using WebDev.Infrastructure.Data;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;
public class ReservationService : IReservationService
{
    private readonly WebDevDbContext _context;

    public ReservationService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reservation>> GetAllReservationsAsync()
    {
        return await _context.Reservations.ToListAsync();
    }
}