using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebDev.Core.DTOs;
using WebDev.Core.Interfaces;

namespace WebDev.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthController(IUserService userService, IJwtTokenGenerator tokenGenerator)
    {
        _userService = userService;
        _tokenGenerator = tokenGenerator;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await _userService.ValidateCredentialsAsync(request.Email, request.Password);
        if (user is null)
        {
            return Unauthorized();
        }

        var token = _tokenGenerator.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddSeconds(_tokenGenerator.AccessTokenLifetimeSeconds);

        var displayName = ResolveDisplayName(user);

        return Ok(new LoginResponseDto
        {
            ID = user.Id,
            Username = displayName,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var (success, errors) = await _userService.CreateUserAsync(request);
        if (!success)
        {
            var errorList = errors?.Where(e => !string.IsNullOrWhiteSpace(e)).ToList() ?? new List<string>();

            if (errorList.Count == 0)
            {
                return Problem(title: "Registration failed.", statusCode: StatusCodes.Status400BadRequest);
            }

            if (errorList.Any(IsConflictError))
            {
                return Conflict(new { errors = errorList });
            }

            foreach (var error in errorList)
            {
                ModelState.AddModelError(string.Empty, error);
            }

            return ValidationProblem(ModelState);
        }

        var user = await _userService.ValidateCredentialsAsync(request.Email, request.Password);
        if (user is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Unable to load user after registration.");
        }

        var token = _tokenGenerator.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddSeconds(_tokenGenerator.AccessTokenLifetimeSeconds);

        var displayName = ResolveDisplayName(user, request);

        return Ok(new RegisterResponseDto
        {
            ID = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? request.FirstName,
            LastName = user.LastName ?? request.LastName,
            DisplayName = displayName,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }
    
    private static bool IsConflictError(string error) =>
        string.Equals(error, "Email is already registered.", StringComparison.OrdinalIgnoreCase);

    private static string ResolveDisplayName(UserDto user, RegisterRequestDto? request = null)
    {
        if (!string.IsNullOrWhiteSpace(user.DisplayName))
        {
            return user.DisplayName!;
        }

        var nameParts = new List<string>();

        if (!string.IsNullOrWhiteSpace(user.FirstName))
        {
            nameParts.Add(user.FirstName!);
        }

        if (!string.IsNullOrWhiteSpace(user.LastName))
        {
            nameParts.Add(user.LastName!);
        }

        if (nameParts.Count == 0 && request is not null)
        {
            if (!string.IsNullOrWhiteSpace(request.FirstName))
            {
                nameParts.Add(request.FirstName);
            }

            if (!string.IsNullOrWhiteSpace(request.LastName))
            {
                nameParts.Add(request.LastName);
            }
        }

        var displayName = string.Join(' ', nameParts.Where(part => !string.IsNullOrWhiteSpace(part))).Trim();
        return string.IsNullOrWhiteSpace(displayName) ? user.Email : displayName;
    }
}
