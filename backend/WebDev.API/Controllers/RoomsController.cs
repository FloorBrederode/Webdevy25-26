using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebDev.Core.DTOs;
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

    [HttpPost("{roomId:int}/availability")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailability(int roomId, [FromBody] RoomAvailabilityRequestDto request)
    {
        if (roomId <= 0)
        {
            return BadRequest("Room id must be positive.");
        }

        if (request is null)
        {
            return BadRequest("Request body is required.");
        }

        if (request.StartTime == default || request.EndTime == default)
        {
            return BadRequest("StartTime and EndTime must be provided.");
        }

        if (request.StartTime >= request.EndTime)
        {
            return BadRequest("StartTime must be earlier than EndTime.");
        }

        var available = await _availabilityService.IsRoomAvailableAsync(roomId, request.StartTime, request.EndTime);

        return Ok(new
        {
            RoomId = roomId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Available = available
        });
    }
}
