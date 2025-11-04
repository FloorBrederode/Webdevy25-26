namespace WebDev.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;
using WebDev.Core.DTOs;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetPayments()
    {
        var payments = await _paymentService.GetAllPaymentsAsync();
        var paymentDTOs = payments.Select(p => new PaymentDTO
        {
            Id = p.Id,
            Amount = p.Amount,
            PaymentDate = p.CompletedAt,
        });
        return Ok(paymentDTOs);
    }
}
