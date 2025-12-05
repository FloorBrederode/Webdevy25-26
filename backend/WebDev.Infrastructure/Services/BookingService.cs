using System;
using System.Linq;
using System.Threading.Tasks;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Infrastructure.Data;

namespace WebDev.Infrastructure.Services;

public sealed class BookingService : IBookingService
{
    private readonly WebDevDbContext _context;

    public BookingService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateEventAsync(string name, string? description, DateTime startTime, DateTime endTime, int? organizerId, int[] roomIds)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (startTime >= endTime) throw new ArgumentException("Start must be before end.");

        var evt = new Event
        {
            Name = name,
            Description = description,
            StartTime = startTime,
            EndTime = endTime,
            OrganizerId = organizerId,
            RoomIds = roomIds?.ToList() ?? new System.Collections.Generic.List<int>()
        };

        _context.Events.Add(evt);
        await _context.SaveChangesAsync();

        return evt.Id;
    }
}
