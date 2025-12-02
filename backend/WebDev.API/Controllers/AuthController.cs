using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            Name = displayName,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await _userService.FindByEmailAsync(request.Email);
        if (user is not null)
        {
            var token = _passwordResetStore.CreateToken(user.Id, TimeSpan.FromMinutes(30));
            var resetLink = BuildResetLink(token);
            await SendResetEmailAsync(user.Email, resetLink);
        }

        return Ok(new { message = "If an account exists for that email, we sent a reset link." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = _passwordResetStore.ConsumeToken(request.Token);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { message = "Reset link is invalid or has expired." });
        }

        var success = await _userService.UpdatePasswordAsync(userId, request.Password);
        if (!success)
        {
            return BadRequest(new { message = "Unable to reset the password right now." });
        }

        return Ok(new { message = "Password has been reset. You can now sign in with your new password." });
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
            Name = displayName,
            PhoneNumber = user.PhoneNumber ?? request.PhoneNumber,
            JobTitle = user.JobTitle ?? request.JobTitle,
            CompanyId = user.CompanyId ?? request.CompanyId,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }
    
    private static bool IsConflictError(string error) =>
        string.Equals(error, "Email is already registered.", StringComparison.OrdinalIgnoreCase);

    private string BuildResetLink(string token)
    {
        var baseUrl = !string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl)
            ? _frontendOptions.BaseUrl!.TrimEnd('/')
            : $"{Request.Scheme}://{Request.Host}";

        return $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private async Task SendResetEmailAsync(string email, string resetLink)
    {
        var subject = "Reset your WebDev password";
        var body = $"""
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <p><a href="{resetLink}">Reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;


        try
        {
            await _emailSender.SendAsync(email, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}. Link: {Link}", email, resetLink);
        }

    }

    private static string ResolveDisplayName(UserDto user, RegisterRequestDto? request = null)
    {
        if (!string.IsNullOrWhiteSpace(user.Name))
        {
            return user.Name;
        }

        if (!string.IsNullOrWhiteSpace(request?.Name))
        {
            return request!.Name;
        }

        return user.Email;
    }
}
