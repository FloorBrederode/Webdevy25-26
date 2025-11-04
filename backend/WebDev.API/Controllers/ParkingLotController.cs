namespace WebDev.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Core.DTOs;

[ApiController]
[Route("api/[controller]")]
public class ParkingLotController : ControllerBase
{
    private readonly IParkingLotService _parkingLotService;

    public ParkingLotController(IParkingLotService parkingLotService)
    {
        _parkingLotService = parkingLotService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetParkingLots()
    {
        var parkingLots = await _parkingLotService.GetAllParkingLotsAsync();
        var parkingLotDTOs = parkingLots.Select(pl => new ParkingLotDTO
        {
            Id = pl.Id,
            Name = pl.Name,
            Location = pl.Location,
            Capacity = pl.Capacity,
            HourlyRate = (decimal)pl.Tariff
        });
        return Ok(parkingLotDTOs);
    }
}
