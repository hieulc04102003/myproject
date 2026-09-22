using MediatR;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Requests;
using ProductManagement.Application.Auth.Responses;

namespace ProductManagement.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterCommand(request));
        return CreatedAtAction(nameof(Register), result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginQuery(request));
        return Ok(result);
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _mediator.Send(new VerifyOtpCommand(request));
        return Ok(result);
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var result = await _mediator.Send(new ResendOtpCommand(request));
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] ProductManagement.Application.Auth.Requests.RefreshRequest request)
    {
        var result = await _mediator.Send(new ProductManagement.Application.Auth.Commands.RefreshTokenCommand(request.RefreshToken));
        return Ok(result);
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] ProductManagement.Application.Auth.Requests.RefreshRequest request)
    {
        await _mediator.Send(new ProductManagement.Application.Auth.Commands.RevokeRefreshTokenCommand(request.RefreshToken));
        return NoContent();
    }
}
