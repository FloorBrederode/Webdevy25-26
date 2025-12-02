using System;
using System.Collections.Generic;
using System.Linq;
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
public sealed class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IPasswordResetStore _passwordResetStore;
    private readonly IEmailSender _emailSender;
    private readonly FrontendOptions _frontendOptions;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserService userService,
        IJwtTokenGenerator tokenGenerator,
        IPasswordResetStore passwordResetStore,
        IEmailSender emailSender,
        IOptions<FrontendOptions> frontendOptions,
        ILogger<AuthController> logger)
    {
        _userService = userService;
        _tokenGenerator = tokenGenerator;
        _passwordResetStore = passwordResetStore;
        _emailSender = emailSender;
        _frontendOptions = frontendOptions.Value;
        _logger = logger;
    }

    [HttpGet("")]
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
            Name = displayName,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }
}
