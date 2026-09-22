using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Commands;

public record CreateProductCommand(
    string Name,
    Guid CategoryId,
    string Slug,
    string? Description,
    decimal BasePrice,
    bool? IsAvailable,
    bool? IsFeatured,
    int StockQuantity = 0,
    List<Guid>? OptionGroupIds = null
) : IRequest<ProductDto>;
