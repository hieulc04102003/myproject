using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Orders.Commands;

namespace ProductManagement.Application.Orders.Handlers;

public class CancelOrderHandler : IRequestHandler<CancelOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelOrderHandler(IOrderRepository orderRepository, IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderDto> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null)
            throw new KeyNotFoundException($"Không tìm thấy đơn hàng với mã ID '{request.OrderId}'.");

        // Kiểm tra quyền: Nếu không phải Admin thì chỉ được hủy đơn của chính mình
        if (!request.IsAdmin && order.UserId != request.CurrentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền hủy đơn hàng này.");
        }

        // Kiểm tra trạng thái: chỉ cho phép hủy khi đang PENDING
        if (!string.Equals(order.OrderStatus, "PENDING", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Chỉ có thể hủy đơn hàng khi ở trạng thái 'Chờ xác nhận' (PENDING). Trạng thái hiện tại: '{order.OrderStatus}'.");
        }

        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            order.OrderStatus = "CANCELLED";
            order.UpdatedAt = DateTime.UtcNow;

            // Hoàn trả tồn kho cho tất cả sản phẩm trong đơn
            if (order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    if (item.ProductId.HasValue && item.Quantity > 0)
                    {
                        await _productRepository.RestoreStockAsync(item.ProductId.Value, item.Quantity, cancellationToken);
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var itemsDto = order.OrderItems?.Select(oi => new OrderItemDto(
                oi.ProductId ?? Guid.Empty,
                oi.ProductName ?? string.Empty,
                oi.Quantity,
                oi.UnitPrice,
                oi.ItemTotalPrice,
                oi.OrderItemOptions?.Select(o => new OrderItemOptionDto(o.OptionId ?? Guid.Empty, o.OptionName, o.OptionPrice)).ToList()
            )).ToList() ?? new List<OrderItemDto>();

            return new OrderDto(
                order.Id,
                order.OrderCode,
                order.UserId ?? Guid.Empty,
                order.Subtotal,
                order.ShippingFee,
                order.DiscountAmount,
                order.TotalAmount,
                order.OrderStatus,
                order.PaymentStatus,
                order.PaymentMethod,
                order.CustomerName,
                order.CustomerPhone,
                order.ShippingAddress,
                order.Note,
                order.CreatedAt,
                itemsDto
            );
        }, cancellationToken);
    }
}
