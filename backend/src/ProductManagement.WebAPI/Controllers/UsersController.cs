using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Users.Commands;
using ProductManagement.Application.Users.Queries;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IMediator mediator, ILogger<UsersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/users/profile
    /// Lấy thông tin hồ sơ của chính người dùng đang đăng nhập.
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var dto = await _mediator.Send(new GetUserProfileQuery(userId.Value), cancellationToken);
        if (dto == null)
            return NotFound(new { message = "Không tìm thấy thông tin người dùng." });

        return Ok(dto);
    }

    /// <summary>
    /// PUT /api/users/profile
    /// Cập nhật thông tin hồ sơ của chính người dùng (Họ tên, Email, Số điện thoại).
    /// TUYỆT ĐỐI không hiển thị hay thay đổi mật khẩu tại endpoint này.
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length < 2)
            return BadRequest(new { message = "Họ và tên phải có tối thiểu 2 ký tự." });

        var dto = await _mediator.Send(
            new UpdateUserProfileCommand(userId.Value, request.FullName, request.Email, request.PhoneNumber),
            cancellationToken);

        if (dto == null)
            return NotFound(new { message = "Không tìm thấy thông tin người dùng." });

        _logger.LogInformation(
            "Người dùng {UserId} ({FullName}) đã cập nhật hồ sơ cá nhân thành công.",
            dto.Id, dto.FullName);

        return Ok(dto);
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(sub, out var guid) ? guid : null;
    }
}

public record UpdateProfileRequest(
    string FullName,
    string? Email,
    string? PhoneNumber
);
