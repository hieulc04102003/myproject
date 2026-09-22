using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class GetHomepageProductsHandler : IRequestHandler<ProductManagement.Application.Products.Queries.GetHomepageProductsQuery, ProductManagement.Application.Common.Dto.PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetHomepageProductsHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductManagement.Application.Common.Dto.PagedResult<ProductDto>> Handle(ProductManagement.Application.Products.Queries.GetHomepageProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _productRepository.GetFeaturedAsync(request.Page, request.PageSize, request.SortBy, request.SortDir, cancellationToken);

        var dtos = items.Select(p => new ProductDto(p.Id, p.Name, p.Slug, p.CategoryId, p.Category?.Name, p.BasePrice, p.ImageUrl, p.IsAvailable, p.IsFeatured, p.StockQuantity)).ToList();

        return new ProductManagement.Application.Common.Dto.PagedResult<ProductDto>(dtos, total, request.Page, request.PageSize);
    }
}
