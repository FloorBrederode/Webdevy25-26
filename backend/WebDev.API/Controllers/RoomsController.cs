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

    [HttpGet("available")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailable([FromQuery] DateTime startTime, [FromQuery] DateTime endTime, [FromQuery] int? companyId)
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader))
            {
                var parts = authHeader.Split(' ');
                if (parts.Length == 2)
                {
                    var token = parts[1];
                    var masked = token.Length > 8 ? "***" + token.Substring(token.Length - 6) : "***";
                    Console.WriteLine($"[RoomsController] Authorization received: {parts[0]} {masked}");
                }
                else
                {
                    Console.WriteLine($"[RoomsController] Authorization header: {authHeader}");
                }
            }
            else
            {
                Console.WriteLine("[RoomsController] No Authorization header received.");
            }
            Console.WriteLine($"[RoomsController] GetAvailable called with companyId={companyId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RoomsController] Logging error: {ex.Message}");
        }
        if (startTime == default || endTime == default)
        {
            return BadRequest("StartTime and EndTime must be provided as query parameters.");
        }

        if (startTime >= endTime)
        {
            return BadRequest("StartTime must be earlier than EndTime.");
        }

        var rooms = _repository.GetAll();
        if (companyId.HasValue)
        {
            rooms = rooms.Where(r => r.CompanyId == companyId.Value);
        }
        var availableRooms = new List<Room>();

        foreach (var r in rooms)
        {
            var isAvailable = await _availabilityService.IsRoomAvailableAsync(r.Id, startTime, endTime);
            if (isAvailable)
            {
                availableRooms.Add(r);
            }
        }

        return Ok(availableRooms);
    }
}
