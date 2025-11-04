using Microsoft.EntityFrameworkCore;
using WebDev.Infrastructure.Data;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;
public class ParkingLotService : IParkingLotService
{
    private readonly WebDevDbContext _context;

    public ParkingLotService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ParkingLot>> GetAllParkingLotsAsync()
    {
        return await _context.ParkingLots.ToListAsync();
    }
}