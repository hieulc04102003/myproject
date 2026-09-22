using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Commands;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    Guid CategoryId,
    string Slug,
    string? Description,
    decimal BasePrice,
    bool? IsAvailable,
    bool? IsFeatured,
    int StockQuantity = 0,
    List<Guid>? OptionGroupIds = null
) : IRequest<ProductDto?>;
