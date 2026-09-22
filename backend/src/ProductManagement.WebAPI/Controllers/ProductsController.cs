using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductManagement.Application.Products.Queries;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Products.Commands;
using Microsoft.AspNetCore.Http;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/products/homepage?page=1&pageSize=10&sortBy=price&sortDir=desc
    [HttpGet("homepage")]
    public async Task<ActionResult<ProductManagement.Application.Common.Dto.PagedResult<ProductDto>>> GetHomepageProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null)
    {
        var result = await _mediator.Send(new GetHomepageProductsQuery(page, pageSize, sortBy, sortDir));
        return Ok(result);
    }

    // GET /api/products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById([FromRoute] Guid id)
    {
        var dto = await _mediator.Send(new ProductManagement.Application.Products.Queries.GetProductByIdQuery(id));
        if (dto == null) return NotFound();

        // Visibility rule: treat null or true as available. If product is explicitly unavailable,
        // only allow users in Admin or Staff role to view it. Other users (including anonymous) get 404.
        var isExplicitlyUnavailable = dto.IsAvailable.HasValue && dto.IsAvailable.Value == false;
        var isStaffOrAdmin = User.IsInRole("Admin") || User.IsInRole("ADMIN") || User.IsInRole("admin") ||
                             User.IsInRole("Staff") || User.IsInRole("STAFF") || User.IsInRole("staff");
        if (isExplicitlyUnavailable && !isStaffOrAdmin)
        {
            return NotFound();
        }

        return Ok(dto);
    }

    // GET /api/products/search?q=phone&page=1&pageSize=10&sortBy=price&sortDir=asc
    [HttpGet("search")]
    public async Task<ActionResult<ProductManagement.Application.Common.Dto.PagedResult<ProductDto>>> SearchProducts([FromQuery(Name = "q")] string? q = null, [FromQuery] Guid? categoryId = null, [FromQuery] string? slug = null, [FromQuery] bool? isAvailable = null, [FromQuery] decimal? minPrice = null, [FromQuery] decimal? maxPrice = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null)
    {
        var result = await _mediator.Send(new ProductManagement.Application.Products.Queries.SearchProductsQuery(q, categoryId, slug, isAvailable, minPrice, maxPrice, page, pageSize, sortBy, sortDir));
        return Ok(result);
    }

    // POST /api/products/{id}/image
    // Phân quyền theo URL: Quyền POST /api/products/{id}/image được cấu hình động trong bảng permissions của DB
    [HttpPost("{id}/image")]
    [Authorize]
    public async Task<ActionResult<string>> UploadImage([FromRoute] Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file provided");

        using var ms = new System.IO.MemoryStream();
        await file.CopyToAsync(ms);
        var content = ms.ToArray();

        var url = await _mediator.Send(new UploadProductImageCommand(id, content, file.FileName));
        return Ok(url);
    }

    // GET /api/products/{id}/options
    [HttpGet("{id}/options")]
    public async Task<ActionResult<List<ProductManagement.Application.Common.Dto.OptionGroupDto>>> GetProductOptions([FromRoute] Guid id)
    {
        var dto = await _mediator.Send(new ProductManagement.Application.Products.Queries.GetProductByIdQuery(id));
        if (dto == null) return NotFound();
        return Ok(dto.OptionGroups ?? new List<ProductManagement.Application.Common.Dto.OptionGroupDto>());
    }

    // POST /api/products
    // Phân quyền theo URL: Quyền POST /api/products được cấu hình động trong bảng permissions của DB
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProductDto>> Create([FromBody] ProductCreationRequest request)
    {
        var dto = await _mediator.Send(new ProductManagement.Application.Products.Commands.CreateProductCommand(
            request.Name, request.CategoryId, request.Slug, request.Description, request.BasePrice, request.IsAvailable, request.IsFeatured, request.StockQuantity ?? 0, request.OptionGroupIds));
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    // DELETE /api/products/{id}
    // Phân quyền theo URL: Quyền DELETE /api/products/{id} được cấu hình động trong bảng permissions của DB
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new ProductManagement.Application.Products.Commands.DeleteProductCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }

    // PUT /api/products/{id}
    // Phân quyền theo URL: Quyền PUT /api/products/{id} được cấu hình động trong bảng permissions của DB
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> Update([FromRoute] Guid id, [FromBody] ProductCreationRequest request)
    {
        var dto = await _mediator.Send(new ProductManagement.Application.Products.Commands.UpdateProductCommand(id, request.Name, request.CategoryId, request.Slug, request.Description, request.BasePrice, request.IsAvailable, request.IsFeatured, request.StockQuantity ?? 0, request.OptionGroupIds));
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // PATCH /api/products/{id}/availability
    // Phân quyền theo URL: Quyền PATCH /api/products/{id}/availability được cấu hình động trong bảng permissions của DB
    [HttpPatch("{id}/availability")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> UpdateAvailability([FromRoute] Guid id, [FromBody] ProductManagement.Application.Products.Commands.UpdateProductAvailabilityCommand request)
    {
        // ensure route id and payload id match
        if (id != request.Id) return BadRequest("Route id and payload id must match");

        var dto = await _mediator.Send(request);
        if (dto == null) return NotFound();
        return Ok(dto);
    }
}

// Simple request model for product creation (kept in WebAPI layer)
public record ProductCreationRequest(string Name, Guid CategoryId, string Slug, string? Description, decimal BasePrice, bool? IsAvailable, bool? IsFeatured, int? StockQuantity = 0, List<Guid>? OptionGroupIds = null);
