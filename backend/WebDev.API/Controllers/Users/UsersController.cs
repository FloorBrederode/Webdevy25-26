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

    // Get current user
    [HttpGet("current")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        // Assuming your auth system sets the user ID in HttpContext
        if (!int.TryParse(User.FindFirst("userId")?.Value, out int userId))
        {
            return Unauthorized();
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(user);
    }

}
