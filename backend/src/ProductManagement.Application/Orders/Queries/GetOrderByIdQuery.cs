using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;
