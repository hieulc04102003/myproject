using MediatR;
// No EF Core dependency required in Application layer
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Orders.Queries;

namespace ProductManagement.Application.Orders.Handlers;

public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderByIdHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null) return null;

        var itemsDto = order.OrderItems.Select(oi => new OrderItemDto(
            oi.ProductId ?? Guid.Empty,
            oi.ProductName ?? string.Empty,
            oi.Quantity,
            oi.UnitPrice,
            oi.ItemTotalPrice,
            oi.OrderItemOptions?.Select(o => new OrderItemOptionDto(o.OptionId ?? Guid.Empty, o.OptionName, o.OptionPrice)).ToList()
        )).ToList();

        return new OrderDto(
            order.Id, order.OrderCode, order.UserId ?? Guid.Empty,
            order.Subtotal, order.ShippingFee, order.DiscountAmount, order.TotalAmount,
            order.OrderStatus, order.PaymentStatus, order.PaymentMethod,
            order.CustomerName, order.CustomerPhone, order.ShippingAddress,
            order.Note, order.CreatedAt, itemsDto
        );
    }
}
