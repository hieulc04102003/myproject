using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Orders.Queries;

public record GetOrdersQuery(Guid? UserId = null, int Page = 1, int PageSize = 20, string? Status = null, DateTime? From = null, DateTime? To = null, string? OrderCode = null) : IRequest<PagedResult<OrderDto>>;
