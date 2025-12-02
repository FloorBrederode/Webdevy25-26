using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RoomsController : ControllerBase
{
    public readonly IRepository<Room> _repository;
    private readonly IRoomAvailabilityService _availabilityService;
    public RoomsController(IRepository<Room> repository, IRoomAvailabilityService availabilityService)
    {
        _repository = repository;
        _availabilityService = availabilityService;
    }

    [HttpGet("all")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = _repository.GetAll();
        return Ok(rooms);
    }

    [HttpGet("{roomId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRoomById(int roomId)
    {
        var room = _repository.FindById(roomId);
        if (room is null)
        {
            return NotFound();
        }
        return Ok(room);
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
