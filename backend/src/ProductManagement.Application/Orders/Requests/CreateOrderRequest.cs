namespace ProductManagement.Application.Orders.Requests;

public record CreateOrderItemRequest(Guid ProductId, int Quantity, List<Guid>? OptionIds = null);

public record CreateOrderRequest(
    Guid UserId,
    List<CreateOrderItemRequest> Items,
    string CustomerName,
    string CustomerPhone,
    string ShippingAddress,
    string PaymentMethod = "COD",
    string? Note = null,
    Guid? AddressId = null,
    Guid? CouponId = null
);
