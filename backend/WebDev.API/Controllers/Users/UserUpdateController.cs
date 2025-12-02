using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;

namespace WebDev.API.Controllers.Users;

[ApiController]
[Route("api/users/update")]
public class UserUpdateController : ControllerBase
{
    private readonly IUserService _userService;




    public UserUpdateController(IUserService userService)
    {
        _userService = userService;
    }


    // Update name
    [HttpPut("{userId:int}/name")]
    public async Task<IActionResult> UpdateName(int userId, [FromBody] string newName)
    {
        var result = await _userService.UpdateNameAsync(userId, newName);
        if (!result)
            return NotFound();

        return NoContent();
    }

    // Update email
    [HttpPut("{userId:int}/email")]
    public async Task<IActionResult> UpdateEmail(int userId, [FromBody] string newEmail)
    {
        var result = await _userService.UpdateEmailAsync(userId, newEmail);
        if (!result)
            return NotFound();

        return NoContent();
    }

    // Update password
    [HttpPut("{userId:int}/password")]
    public async Task<IActionResult> UpdatePassword(int userId, [FromBody] string newPassword)
    {
        var result = await _userService.UpdatePasswordAsync(userId, newPassword);
        if (!result)
            return NotFound();

        return NoContent();
    }

    // Delete user
    [HttpDelete("{userId:int}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var result = await _userService.DeleteUserAsync(userId);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
