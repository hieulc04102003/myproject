using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class GetProductByIdHandler : IRequestHandler<ProductManagement.Application.Products.Queries.GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;

    public GetProductByIdHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductDto?> Handle(ProductManagement.Application.Products.Queries.GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null) return null;

        var optionGroups = product.ProductOptionGroups?
            .Where(pog => pog.OptionGroup != null)
            .OrderBy(pog => pog.DisplayOrder ?? 0)
            .Select(pog => new OptionGroupDto(
                pog.OptionGroup.Id,
                pog.OptionGroup.Name,
                pog.OptionGroup.SelectionType,
                pog.OptionGroup.IsRequired,
                pog.OptionGroup.MinSelection,
                pog.OptionGroup.MaxSelection,
                pog.OptionGroup.Options?
                    .OrderBy(o => o.DisplayOrder ?? 0)
                    .Select(o => new OptionDto(o.Id, o.Name, o.PriceModifier, o.IsAvailable))
                    .ToList() ?? new List<OptionDto>()
            )).ToList();

        return new ProductDto(
            product.Id,
            product.Name,
            product.Slug,
            product.CategoryId,
            product.Category?.Name,
            product.BasePrice,
            product.ImageUrl,
            product.IsAvailable,
            product.IsFeatured,
            product.StockQuantity,
            optionGroups
        );
    }
}
