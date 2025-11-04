using Microsoft.EntityFrameworkCore;
using WebDev.Infrastructure.Data;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;
public class VehicleService : IVehicleService
{
    private readonly WebDevDbContext _context;

    public VehicleService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Vehicle>> GetAllVehiclesAsync()
    {
        return await _context.Vehicles.ToListAsync();
    }
}