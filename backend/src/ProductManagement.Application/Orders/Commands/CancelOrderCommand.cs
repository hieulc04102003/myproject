using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Orders.Commands;

public record CancelOrderCommand(Guid OrderId, Guid CurrentUserId, bool IsAdmin = false) : IRequest<OrderDto>;
