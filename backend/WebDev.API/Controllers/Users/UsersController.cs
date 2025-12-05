using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;

namespace WebDev.API.Controllers.Users;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // Get full user info
    [HttpGet("{userId:int}")]
    public async Task<ActionResult<UserDto>> GetUserInfo(int userId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    // Get all users
    [HttpGet("all")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();

        if (users == null || !users.Any())
            return Ok(new List<UserDto>());

        return Ok(users);
    }

    // Get users for a specific company
    [HttpGet("company/{companyId:int}")]
    public async Task<ActionResult<List<UserDto>>> GetUsersByCompany(int companyId)
    {
        if (companyId <= 0) return BadRequest("Invalid company id.");

        var users = await _userService.GetAllUsersAsync();
        var filtered = users.Where(u => u.CompanyId.HasValue && u.CompanyId.Value == companyId).ToList();
        return Ok(filtered);
    }

    // Get current user
    [HttpGet("current")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        // Log incoming Authorization header for debugging
        try
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader))
            {
                // Mask token when logging
                var parts = authHeader.Split(' ');
                if (parts.Length == 2)
                {
                    var scheme = parts[0];
                    var token = parts[1];
                    var masked = token.Length > 8 ? "***" + token.Substring(token.Length - 6) : "***";
                    Console.WriteLine($"[UsersController] Authorization received: {scheme} {masked}");
                }
                else
                {
                    Console.WriteLine($"[UsersController] Authorization header: {authHeader}");
                }
            }
            else
            {
                Console.WriteLine("[UsersController] No Authorization header received.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UsersController] Error reading Authorization header: {ex.Message}");
        }

        // Attempt to read user id from common claim types (sub, nameidentifier, userId)
        string? userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                            ?? User.FindFirst("userId")?.Value
                            ?? User.FindFirst("id")?.Value;

        // log the claim value for debugging
        try { Console.WriteLine($"[UsersController] Resolved userIdClaim='{userIdClaim}'"); } catch {}

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(user);
    }

}
