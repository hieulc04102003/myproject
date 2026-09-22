using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Users.Commands;
using ProductManagement.Application.Users.Queries;

namespace ProductManagement.WebAPI.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
// Phân quyền theo URL: Toàn bộ API /api/admin/* được kiểm soát động qua DynamicPermissionMiddleware
// Admin mặc định có toàn quyền; các quyền khác được cấu hình trong bảng permissions của DB
[Authorize]
public class AdminUsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserAddressRepository _addressRepository;

    public AdminUsersController(IMediator mediator, IUserAddressRepository addressRepository)
    {
        _mediator = mediator;
        _addressRepository = addressRepository;
    }

    // GET /api/admin/users?page=1&pageSize=20&role=Customer&search=nguyen&isActive=true
    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? role = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _mediator.Send(new GetUsersQuery(page, pageSize, role, search, isActive));
        return Ok(result);
    }

    // GET /api/admin/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById([FromRoute] Guid id)
    {
        var user = await _mediator.Send(new GetUserByIdQuery(id));
        if (user == null) return NotFound();
        return Ok(user);
    }

    // GET /api/admin/users/{id}/addresses
    // Lấy danh sách địa chỉ giao hàng của một user (Admin only)
    [HttpGet("{id}/addresses")]
    public async Task<ActionResult<IReadOnlyList<UserAddressDto>>> GetUserAddresses(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _mediator.Send(new GetUserByIdQuery(id), cancellationToken);
        if (user == null) return NotFound();

        var addresses = await _addressRepository.GetByUserIdAsync(id, cancellationToken);

        var dtos = addresses.Select(a =>
        {
            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(a.StreetAddress)) parts.Add(a.StreetAddress);
            if (!string.IsNullOrWhiteSpace(a.Ward)) parts.Add(a.Ward);
            if (!string.IsNullOrWhiteSpace(a.District)) parts.Add(a.District);
            if (!string.IsNullOrWhiteSpace(a.City)) parts.Add(a.City);

            return new UserAddressDto(
                a.Id,
                a.UserId,
                a.RecipientName,
                a.PhoneNumber,
                a.StreetAddress,
                a.Ward,
                a.District,
                a.City,
                a.IsDefault ?? false,
                string.Join(", ", parts),
                a.CreatedAt
            );
        }).ToList();

        return Ok(dtos);
    }

    // POST /api/admin/users
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserCommand request)
    {
        var dto = await _mediator.Send(request);
        return CreatedAtAction(nameof(GetUserById), new { id = dto.Id }, dto);
    }

    // PUT /api/admin/users/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(
        [FromRoute] Guid id,
        [FromBody] UpdateUserCommand request)
    {
        if (id != request.Id) return BadRequest("Route id and payload id must match");
        var dto = await _mediator.Send(request);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new DeleteUserCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
