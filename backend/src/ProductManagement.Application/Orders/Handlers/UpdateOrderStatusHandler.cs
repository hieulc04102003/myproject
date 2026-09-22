using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Orders.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Orders.Handlers;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
{
    private static readonly string[] AllowedStatuses = { "PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "COMPLETED", "CANCELLED" };

    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ProductManagement.Application.Common.Interfaces.IOrderStatusNotifier _statusNotifier;

    public UpdateOrderStatusHandler(IOrderRepository orderRepository, IProductRepository productRepository, IUnitOfWork unitOfWork, ProductManagement.Application.Common.Interfaces.IOrderStatusNotifier statusNotifier)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _statusNotifier = statusNotifier;
    }

    public async Task<OrderDto> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var status = request.Status?.Trim().ToUpperInvariant() ?? string.Empty;
        // Chấp nhận bí danh cũ từ client và quy về giá trị chuẩn của DB
        status = status switch
        {
            "PROCESSING" => "CONFIRMED",
            "SHIPPED" => "SHIPPING",
            "PREPARING" => "PREPARING",
            "CONFIRMED" => "CONFIRMED",
            _ => status
        };
        if (!AllowedStatuses.Contains(status))
            throw new ArgumentException($"Invalid status '{request.Status}'. Allowed: {string.Join(", ", AllowedStatuses)}");

        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null) return null!;

        var previousStatus = order.OrderStatus;
        order.OrderStatus = status;
        order.UpdatedAt = DateTime.UtcNow;

        var result = await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Nếu hủy đơn hàng và trước đó chưa hủy -> hoàn trả tồn kho
            if (!string.Equals(previousStatus, "CANCELLED", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(status, "CANCELLED", StringComparison.OrdinalIgnoreCase))
            {
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

        // Phát sự kiện real-time sau khi commit thành công
        await _statusNotifier.NotifyOrderStatusChangedAsync(
            order.UserId,
            order.OrderCode ?? string.Empty,
            previousStatus,
            status,
            cancellationToken);

        return result;
    }
}


