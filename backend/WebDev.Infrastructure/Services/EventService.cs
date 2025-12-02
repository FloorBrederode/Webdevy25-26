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

        var events = await _context.Events
            .AsNoTracking()
            .ToListAsync();

        return events
            .Where(e => IsUserParticipant(e, userId))
            .OrderBy(e => e.StartTime)
            .ToList();
    }

    public async Task<IReadOnlyList<Event>> GetEventsByUserAndDateAsync(int userId, DateTime date)
    {
        if (userId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(userId), "User id must be positive.");
        }

        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);

        var events = await _context.Events
            .AsNoTracking()
            .Where(e => e.StartTime < dayEnd && e.EndTime > dayStart)
            .ToListAsync();

        return events
            .Where(e => IsUserParticipant(e, userId))
            .OrderBy(e => e.StartTime)
            .ToList();
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

        var results = new List<Event>();
        var seenEventIds = new HashSet<int>();

        for (var currentDate = startDate.Date; currentDate <= endDate.Date; currentDate = currentDate.AddDays(1))
        {
            var eventsForDay = await GetEventsByUserAndDateAsync(userId, currentDate);

            foreach (var evt in eventsForDay)
            {
                if (seenEventIds.Add(evt.Id))
                {
                    results.Add(evt);
                }
            }
        }

        return results
            .OrderBy(e => e.StartTime)
            .ToList();
    }

    private static bool IsUserParticipant(Event evt, int userId) =>
        evt.OrganizerId == userId || evt.AttendeeIds.Contains(userId);
}
