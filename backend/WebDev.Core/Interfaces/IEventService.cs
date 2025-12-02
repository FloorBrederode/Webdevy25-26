using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebDev.Core.Models;

namespace WebDev.Core.Interfaces;

public interface IEventService
{
    Task<IReadOnlyList<Event>> GetEventsByUserAsync(int userId);
    Task<IReadOnlyList<Event>> GetEventsByUserAndDateAsync(int userId, DateTime date);
    Task<IReadOnlyList<Event>> GetEventsByUserAndDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
}
