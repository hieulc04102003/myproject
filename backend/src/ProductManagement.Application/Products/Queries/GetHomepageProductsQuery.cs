using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Queries;

public record GetHomepageProductsQuery(int Page = 1, int PageSize = 10, string? SortBy = null, string? SortDir = null) : IRequest<ProductManagement.Application.Common.Dto.PagedResult<ProductDto>>;
