using MediatR;

namespace ProductManagement.Application.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, string Status, Guid? ChangedByUserId = null) : IRequest<ProductManagement.Application.Common.Dto.OrderDto>;
