using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Infrastructure.Data;

namespace WebDev.Infrastructure.Services;

public sealed class EventService : IEventService
{
    private readonly WebDevDbContext _context;

    public EventService(WebDevDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Event>> GetEventsByUserAsync(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(userId), "User id must be positive.");
        }

        return await _context.Events
            .AsNoTracking()
            .Include(e => e.Attendees)
            .Where(e => e.OrganizerId == userId || e.Attendees.Any(a => a.UserId == userId))
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Event>> GetEventsByUserAndDateAsync(int userId, DateTime date)
    {
        if (userId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(userId), "User id must be positive.");
        }

        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);

        return await _context.Events
            .AsNoTracking()
            .Include(e => e.Attendees)
            .Where(e => e.StartTime < dayEnd && e.EndTime > dayStart)
            .Where(e => e.OrganizerId == userId || e.Attendees.Any(a => a.UserId == userId))
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Event>> GetEventsByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        if (userId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(userId), "User id must be positive.");
        }

        if (startDate.Date > endDate.Date)
        {
            throw new ArgumentException("Start date must not be after end date.");
        }

        var rangeStart = startDate.Date;
        var rangeEndExclusive = endDate.Date.AddDays(1);

        return await _context.Events
            .AsNoTracking()
            .Include(e => e.Attendees)
            .Where(e => e.StartTime < rangeEndExclusive && e.EndTime > rangeStart)
            .Where(e => e.OrganizerId == userId || e.Attendees.Any(a => a.UserId == userId))
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }
}
