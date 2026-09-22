using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class GetProductsByCategoryHandler : IRequestHandler<ProductManagement.Application.Products.Queries.GetProductsByCategoryQuery, ProductManagement.Application.Common.Dto.PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsByCategoryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductManagement.Application.Common.Dto.PagedResult<ProductDto>> Handle(ProductManagement.Application.Products.Queries.GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _productRepository.SearchAsync(null, request.CategoryId, null, null, null, null, request.Page, request.PageSize, request.SortBy, request.SortDir, cancellationToken);

        var dtos = items.Select(p => new ProductDto(p.Id, p.Name, p.Slug, p.CategoryId, p.Category?.Name, p.BasePrice, p.ImageUrl, p.IsAvailable, p.IsFeatured, p.StockQuantity)).ToList();

        return new ProductManagement.Application.Common.Dto.PagedResult<ProductDto>(dtos, total, request.Page, request.PageSize);
    }
}
