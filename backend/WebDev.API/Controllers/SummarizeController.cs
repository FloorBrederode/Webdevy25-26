using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Net;
using System.Net.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;
using WebDev.API.Configuration;

namespace WebDev.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SummarizeController : ControllerBase
{
    private readonly IOpenaiConnector _connector;
    public SummarizeController(IOpenaiConnector connector)
    {
        _connector = connector;
    }

    [HttpGet()]
    [Authorize]
    public async Task<ActionResult<string>> Summarize()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdValue) || !int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized("User id not found in token.");
        }

        try
        {
            var answer = await _connector.AskGPT(userId);
            return Ok(answer);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, ex.Message);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, $"Error calling OpenAI: {ex.Message}");
        }
    }
}
