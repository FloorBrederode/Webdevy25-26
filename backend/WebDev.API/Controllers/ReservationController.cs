namespace WebDev.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Core.DTOs;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetReservations()
    {
        var reservations = await _reservationService.GetAllReservationsAsync();
        var reservationDTOs = reservations.Select(r => new ReservationDTO
        {
            Id = r.Id,
            VehicleId = r.VehicleId,
            ParkingLotId = r.ParkingLotId,
            StartTime = r.StartTime,
            EndTime = r.EndTime
        });
        return Ok(reservationDTOs);
    }
}