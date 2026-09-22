using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Options.Commands;
using ProductManagement.Application.Options.Queries;
using ProductManagement.Application.Products.Queries;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OptionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public OptionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/options/groups
    [HttpGet("groups")]
    public async Task<ActionResult<List<OptionGroupDto>>> GetAllGroups()
    {
        var groups = await _mediator.Send(new GetOptionGroupsQuery());
        return Ok(groups);
    }

    // GET /api/options/groups/{id}
    [HttpGet("groups/{id}")]
    public async Task<ActionResult<OptionGroupDto>> GetGroupById([FromRoute] Guid id)
    {
        var group = await _mediator.Send(new GetOptionGroupByIdQuery(id));
        if (group == null) return NotFound();
        return Ok(group);
    }

    // POST /api/options/groups
    // Phân quyền theo URL: Quyền POST /api/options/groups được cấu hình động trong bảng permissions của DB
    [HttpPost("groups")]
    [Authorize]
    public async Task<ActionResult<OptionGroupDto>> CreateGroup([FromBody] CreateOptionGroupCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetGroupById), new { id = result.Id }, result);
    }

    // PUT /api/options/groups/{id}
    // Phân quyền theo URL: Quyền PUT /api/options/groups/{id} được cấu hình động trong bảng permissions của DB
    [HttpPut("groups/{id}")]
    [Authorize]
    public async Task<ActionResult<OptionGroupDto>> UpdateGroup([FromRoute] Guid id, [FromBody] UpdateOptionGroupCommand command)
    {
        if (id != command.Id) return BadRequest("Route ID and payload ID must match");
        var result = await _mediator.Send(command);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/options/groups/{id}
    // Phân quyền theo URL: Quyền DELETE /api/options/groups/{id} được cấu hình động trong bảng permissions của DB
    [HttpDelete("groups/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteGroup([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new DeleteOptionGroupCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }

    // POST /api/options/groups/{groupId}/items
    // Phân quyền theo URL: Quyền POST /api/options/groups/{groupId}/items được cấu hình động trong bảng permissions của DB
    [HttpPost("groups/{groupId}/items")]
    [Authorize]
    public async Task<ActionResult<OptionDto>> CreateOption([FromRoute] Guid groupId, [FromBody] CreateOptionCommand command)
    {
        if (groupId != command.OptionGroupId)
        {
            command = command with { OptionGroupId = groupId };
        }
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // PUT /api/options/items/{id}
    // Phân quyền theo URL: Quyền PUT /api/options/items/{id} được cấu hình động trong bảng permissions của DB
    [HttpPut("items/{id}")]
    [Authorize]
    public async Task<ActionResult<OptionDto>> UpdateOption([FromRoute] Guid id, [FromBody] UpdateOptionCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }
        var result = await _mediator.Send(command);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/options/items/{id}
    // Phân quyền theo URL: Quyền DELETE /api/options/items/{id} được cấu hình động trong bảng permissions của DB
    [HttpDelete("items/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteOption([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new DeleteOptionCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }

    // PATCH /api/options/items/{id}/toggle
    // Phân quyền theo URL: Quyền PATCH /api/options/items/{id}/toggle được cấu hình động trong bảng permissions của DB
    [HttpPatch("items/{id}/toggle")]
    [Authorize]
    public async Task<ActionResult<OptionDto>> ToggleOptionAvailability([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new ToggleOptionAvailabilityCommand(id));
        if (result == null) return NotFound();
        return Ok(result);
    }
}
