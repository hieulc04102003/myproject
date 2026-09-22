using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Queries;

public record SearchProductsQuery(string? Query = null, Guid? CategoryId = null, string? Slug = null, bool? IsAvailable = null, decimal? MinPrice = null, decimal? MaxPrice = null, int Page = 1, int PageSize = 10, string? SortBy = null, string? SortDir = null)
    : IRequest<ProductManagement.Application.Common.Dto.PagedResult<ProductManagement.Application.Common.Dto.ProductDto>>;
