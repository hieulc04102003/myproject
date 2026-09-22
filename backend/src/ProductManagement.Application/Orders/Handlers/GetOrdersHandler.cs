using MediatR;
// No EF Core dependency required in Application layer
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Orders.Queries;

namespace ProductManagement.Application.Orders.Handlers;

public class GetOrdersHandler : IRequestHandler<GetOrdersQuery, PagedResult<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrdersHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<PagedResult<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _orderRepository.GetPagedAsync(request.UserId, request.Page, request.PageSize, request.Status, request.From, request.To, request.OrderCode, cancellationToken);

        var dtos = items.Select(o => new OrderDto(
            o.Id, o.OrderCode, o.UserId ?? Guid.Empty,
            o.Subtotal, o.ShippingFee, o.DiscountAmount, o.TotalAmount,
            o.OrderStatus, o.PaymentStatus, o.PaymentMethod,
            o.CustomerName, o.CustomerPhone, o.ShippingAddress,
            o.Note, o.CreatedAt,
            o.OrderItems.Select(oi => new OrderItemDto(
                oi.ProductId ?? Guid.Empty,
                oi.ProductName ?? string.Empty,
                oi.Quantity,
                oi.UnitPrice,
                oi.ItemTotalPrice,
                oi.OrderItemOptions?.Select(opt => new OrderItemOptionDto(opt.OptionId ?? Guid.Empty, opt.OptionName, opt.OptionPrice)).ToList()
            )).ToList()
        )).ToList();

        return new PagedResult<OrderDto>(dtos, total, request.Page, request.PageSize);
    }
}
