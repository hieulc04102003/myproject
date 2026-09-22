using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class SearchProductsHandler : IRequestHandler<ProductManagement.Application.Products.Queries.SearchProductsQuery, ProductManagement.Application.Common.Dto.PagedResult<ProductManagement.Application.Common.Dto.ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public SearchProductsHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductManagement.Application.Common.Dto.PagedResult<ProductManagement.Application.Common.Dto.ProductDto>> Handle(ProductManagement.Application.Products.Queries.SearchProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _productRepository.SearchAsync(request.Query, request.CategoryId, request.Slug, request.IsAvailable, request.MinPrice, request.MaxPrice, request.Page, request.PageSize, request.SortBy, request.SortDir, cancellationToken);

        var dtos = items.Select(p => new ProductDto(
            p.Id,
            p.Name,
            p.Slug,
            p.CategoryId,
            p.Category?.Name,
            p.BasePrice,
            p.ImageUrl,
            p.IsAvailable,
            p.IsFeatured,
            p.StockQuantity,
            p.ProductOptionGroups?
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
                )).ToList()
        )).ToList();

        return new ProductManagement.Application.Common.Dto.PagedResult<ProductManagement.Application.Common.Dto.ProductDto>(dtos, total, request.Page, request.PageSize);
    }
}
