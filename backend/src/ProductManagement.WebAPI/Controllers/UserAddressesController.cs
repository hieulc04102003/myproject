using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.UserAddresses.Commands;
using ProductManagement.Application.UserAddresses.Queries;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/user-addresses")]
[Authorize]
public class UserAddressesController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserAddressesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// GET /api/user-addresses
    /// Lấy danh sách địa chỉ giao hàng của người dùng hiện tại.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserAddressDto>>> GetMyAddresses(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var result = await _mediator.Send(new GetMyAddressesQuery(userId.Value), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// GET /api/user-addresses/{id}
    /// Lấy chi tiết một địa chỉ giao hàng.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserAddressDto>> GetAddressById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var dto = await _mediator.Send(new GetUserAddressByIdQuery(userId.Value, id), cancellationToken);
        if (dto == null)
            return NotFound(new { message = "Không tìm thấy địa chỉ." });

        return Ok(dto);
    }

    /// <summary>
    /// POST /api/user-addresses
    /// Thêm một địa chỉ giao hàng mới.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserAddressDto>> CreateAddress(
        [FromBody] CreateUserAddressRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        if (string.IsNullOrWhiteSpace(request.RecipientName))
            return BadRequest(new { message = "Tên người nhận không được để trống." });

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return BadRequest(new { message = "Số điện thoại không được để trống." });

        if (string.IsNullOrWhiteSpace(request.StreetAddress))
            return BadRequest(new { message = "Địa chỉ chi tiết (số nhà, tên đường) không được để trống." });

        var dto = await _mediator.Send(
            new CreateUserAddressCommand(
                userId.Value,
                request.RecipientName,
                request.PhoneNumber,
                request.StreetAddress,
                request.Ward,
                request.District,
                request.City,
                request.IsDefault),
            cancellationToken);

        return CreatedAtAction(nameof(GetAddressById), new { id = dto.Id }, dto);
    }

    /// <summary>
    /// PUT /api/user-addresses/{id}
    /// Chỉnh sửa thông tin địa chỉ giao hàng.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserAddressDto>> UpdateAddress(
        [FromRoute] Guid id,
        [FromBody] UpdateUserAddressRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        if (string.IsNullOrWhiteSpace(request.RecipientName))
            return BadRequest(new { message = "Tên người nhận không được để trống." });

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return BadRequest(new { message = "Số điện thoại không được để trống." });

        if (string.IsNullOrWhiteSpace(request.StreetAddress))
            return BadRequest(new { message = "Địa chỉ chi tiết (số nhà, tên đường) không được để trống." });

        var dto = await _mediator.Send(
            new UpdateUserAddressCommand(
                userId.Value,
                id,
                request.RecipientName,
                request.PhoneNumber,
                request.StreetAddress,
                request.Ward,
                request.District,
                request.City,
                request.IsDefault),
            cancellationToken);

        if (dto == null)
            return NotFound(new { message = "Không tìm thấy địa chỉ để cập nhật." });

        return Ok(dto);
    }

    /// <summary>
    /// DELETE /api/user-addresses/{id}
    /// Xóa địa chỉ giao hàng.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var success = await _mediator.Send(new DeleteUserAddressCommand(userId.Value, id), cancellationToken);
        if (!success)
            return NotFound(new { message = "Không tìm thấy địa chỉ để xóa." });

        return Ok(new { message = "Xóa địa chỉ thành công." });
    }

    /// <summary>
    /// PATCH /api/user-addresses/{id}/default
    /// Đặt địa chỉ làm mặc định.
    /// </summary>
    [HttpPatch("{id}/default")]
    public async Task<IActionResult> SetDefaultAddress(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var success = await _mediator.Send(new SetDefaultAddressCommand(userId.Value, id), cancellationToken);
        if (!success)
            return NotFound(new { message = "Không tìm thấy địa chỉ." });

        return Ok(new { message = "Đặt địa chỉ làm mặc định thành công." });
    }

    private Guid? GetCurrentUserId()
    {
        var val = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.Identity?.Name;

        return !string.IsNullOrEmpty(val) && Guid.TryParse(val, out var guid) ? guid : null;
    }
}
