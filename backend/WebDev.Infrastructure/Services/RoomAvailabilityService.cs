using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebDev.Core.Interfaces;
using WebDev.Infrastructure.Data;

namespace WebDev.Infrastructure.Services;

public sealed class RoomAvailabilityService : IRoomAvailabilityService
{
    private readonly WebDevDbContext _context;

    public RoomAvailabilityService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime)
    {
        if (roomId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(roomId), "Room id must be positive.");
        }

        if (startTime >= endTime)
        {
            throw new ArgumentException("Start time must be earlier than end time.");
        }

        var overlappingEvents = await _context.Events
            .AsNoTracking()
            .Where(e => !(endTime <= e.StartTime || startTime >= e.EndTime))
            .Select(e => new { e.RoomIds })
            .ToListAsync();

        var hasConflict = overlappingEvents.Any(e => e.RoomIds.Contains(roomId));
        return !hasConflict;
    }
}
