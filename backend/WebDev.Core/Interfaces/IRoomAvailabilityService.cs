using System;
using System.Threading.Tasks;

namespace WebDev.Core.Interfaces;

public interface IRoomAvailabilityService
{
    Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime);
}
