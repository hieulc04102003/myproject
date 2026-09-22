using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Coupons.Commands;
using ProductManagement.Application.Coupons.DTOs;
using ProductManagement.Application.Coupons.Queries;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/coupons?search=&isActive=&page=1&pageSize=20
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PagedResult<CouponDto>>> GetCoupons(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetCouponsQuery(search, isActive, page, pageSize));
        return Ok(result);
    }

    // GET /api/coupons/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<CouponDto>> GetById([FromRoute] Guid id)
    {
        var coupon = await _mediator.Send(new GetCouponByIdQuery(id));
        if (coupon == null) return NotFound();
        return Ok(coupon);
    }

    // GET /api/coupons/active — public endpoint for homepage voucher display
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CouponDto>>> GetActive()
    {
        var result = await _mediator.Send(new GetActiveCouponsQuery());
        return Ok(result);
    }

    // GET /api/coupons/validate?code=SALE10&orderTotal=200000
    [HttpGet("validate")]
    public async Task<ActionResult<CouponValidationResultDto>> Validate(
        [FromQuery] string code,
        [FromQuery] decimal orderTotal)
    {
        var result = await _mediator.Send(new ValidateCouponQuery(code, orderTotal));
        return Ok(result);
    }

    // POST /api/coupons
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CreateCouponCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/coupons/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<CouponDto>> Update([FromRoute] Guid id, [FromBody] UpdateCouponCommand command)
    {
        if (id != command.Id) return BadRequest("Route id and payload id must match");
        var result = await _mediator.Send(command);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // PATCH /api/coupons/{id}/toggle
    [HttpPatch("{id}/toggle")]
    [Authorize]
    public async Task<ActionResult<CouponDto>> ToggleStatus([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new ToggleCouponStatusCommand(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/coupons/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new DeleteCouponCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
