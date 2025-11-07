using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebDev.Core.Interfaces;

namespace WebDev.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RoomsController : ControllerBase
{
    private readonly IRoomAvailabilityService _availabilityService;

    public RoomsController(IRoomAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    [HttpGet("{roomId:int}/availability")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailability(int roomId, [FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
    {
        if (roomId <= 0)
        {
            return BadRequest("Room id must be positive.");
        }

        if (startTime == default || endTime == default)
        {
            return BadRequest("StartTime and EndTime query parameters are required.");
        }

        if (startTime >= endTime)
        {
            return BadRequest("StartTime must be earlier than EndTime.");
        }

        var available = await _availabilityService.IsRoomAvailableAsync(roomId, startTime, endTime);

        return Ok(new
        {
            RoomId = roomId,
            StartTime = startTime,
            EndTime = endTime,
            Available = available
        });
    }
}
