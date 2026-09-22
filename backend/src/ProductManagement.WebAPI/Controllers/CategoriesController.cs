using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/categories
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var categories = await _mediator.Send(new ProductManagement.Application.Categories.Queries.GetAllCategoriesQuery());
        return Ok(categories);
    }

    // GET /api/categories/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetById([FromRoute] Guid id)
    {
        var dto = await _mediator.Send(new ProductManagement.Application.Categories.Queries.GetCategoryByIdQuery(id));
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // GET /api/categories/{id}/products
    [HttpGet("{id}/products")]
    public async Task<ActionResult<ProductManagement.Application.Common.Dto.PagedResult<ProductManagement.Application.Common.Dto.ProductDto>>> GetProductsByCategory([FromRoute] Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null)
    {
        var result = await _mediator.Send(new ProductManagement.Application.Products.Queries.GetProductsByCategoryQuery(id, page, pageSize, sortBy, sortDir));
        return Ok(result);
    }

    // POST /api/categories
    // Phân quyền theo URL: Quyền POST /api/categories được cấu hình động trong bảng permissions của DB
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] ProductManagement.Application.Categories.Commands.CreateCategoryCommand request)
    {
        var dto = await _mediator.Send(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    // PUT /api/categories/{id}
    // Phân quyền theo URL: Quyền PUT /api/categories/{id} được cấu hình động trong bảng permissions của DB
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<CategoryDto>> Update([FromRoute] Guid id, [FromBody] ProductManagement.Application.Categories.Commands.UpdateCategoryCommand request)
    {
        if (id != request.Id) return BadRequest("Route id and payload id must match");
        var dto = await _mediator.Send(request);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // DELETE /api/categories/{id}
    // Phân quyền theo URL: Quyền DELETE /api/categories/{id} được cấu hình động trong bảng permissions của DB
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new ProductManagement.Application.Categories.Commands.DeleteCategoryCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
