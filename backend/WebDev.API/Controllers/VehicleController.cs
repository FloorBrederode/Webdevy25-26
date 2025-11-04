namespace WebDev.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Core.DTOs;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehicleController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetVehicles()
    {
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        var vehicleDTOs = vehicles.Select(v => new VehicleDTO
        {
            Id = v.Id,
            LicensePlate = v.LicensePlate,
            Model = v.Model,
        });
        return Ok(vehicleDTOs);
    }
}