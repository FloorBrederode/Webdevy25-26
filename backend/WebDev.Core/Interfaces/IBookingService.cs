using System;
using System.Threading.Tasks;

namespace WebDev.Core.Interfaces;

public interface IBookingService
{
    Task<int> CreateEventAsync(string name, string? description, DateTime startTime, DateTime endTime, int? organizerId, int[] roomIds);
}
