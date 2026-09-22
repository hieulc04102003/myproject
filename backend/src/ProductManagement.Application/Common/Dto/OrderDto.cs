namespace ProductManagement.Application.Common.Dto;

public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal ItemTotalPrice, List<OrderItemOptionDto>? Options = null);

public record OrderDto(
    Guid Id,
    string OrderCode,
    Guid UserId,
    decimal Subtotal,
    decimal ShippingFee,
    decimal DiscountAmount,
    decimal TotalAmount,
    string OrderStatus,
    string PaymentStatus,
    string PaymentMethod,
    string CustomerName,
    string CustomerPhone,
    string ShippingAddress,
    string? Note,
    DateTime CreatedAt,
    List<OrderItemDto> Items
);
