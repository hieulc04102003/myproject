using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Orders.Commands;
using ProductManagement.Application.Orders.Requests;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        // Optionally, verify that the authenticated user matches request.UserId or allow admin to create for others
        var result = await _mediator.Send(new CreateOrderCommand(request));
        return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderById([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new ProductManagement.Application.Orders.Queries.GetOrderByIdQuery(id));
        if (result == null) return NotFound();
        // enforce authorization: non-admins and non-staff can only view their own orders
        var role = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isPrivileged = string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase) || 
                           string.Equals(role, "STAFF", StringComparison.OrdinalIgnoreCase);
        if (!isPrivileged)
        {
            if (Guid.TryParse(sub, out var currentUserId))
            {
                if (result.UserId != currentUserId)
                    return Forbid();
            }
            else
            {
                return Forbid();
            }
        }

        return Ok(result);
    }

    // PATCH /api/orders/{id}/status
    // Phân quyền theo URL: Quyền PATCH /api/orders/{id}/status được cấu hình động trong bảng permissions của DB
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<ActionResult<OrderDto>> UpdateStatus([FromRoute] Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var changedBy = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var uid) ? uid : (Guid?)null;
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, request.Status, changedBy));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // POST /api/orders/{id}/cancel
    // User can cancel their own PENDING order; Admin and Staff can cancel any order
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrder([FromRoute] Guid id)
    {
        var role = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;
        var isPrivileged = string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase) || 
                           string.Equals(role, "STAFF", StringComparison.OrdinalIgnoreCase);

        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(sub, out var currentUserId))
        {
            return Unauthorized();
        }

        var result = await _mediator.Send(new ProductManagement.Application.Orders.Commands.CancelOrderCommand(id, currentUserId, isPrivileged));
        return Ok(result);
    }

    public record UpdateOrderStatusRequest(string Status);

    // GET /api/orders?page=1&pageSize=20 or GET /api/orders?userId={userId}
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetOrders([FromQuery] Guid? userId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] string? orderCode = null)
    {
        // If caller is not Admin or Staff, force userId to current user
        var role = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;
        var isPrivileged = string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase) || 
                           string.Equals(role, "STAFF", StringComparison.OrdinalIgnoreCase);
        if (!isPrivileged)
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(sub, out var currentUserId))
            {
                userId = currentUserId;
            }
            else
            {
                return Forbid();
            }
        }

        var result = await _mediator.Send(new ProductManagement.Application.Orders.Queries.GetOrdersQuery(userId, page, pageSize, status, from, to, orderCode));
        return Ok(result);
    }
}
