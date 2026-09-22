using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Orders.Commands;
using ProductManagement.Application.Orders.Requests;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Orders.Handlers;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOptionRepository _optionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserAddressRepository _userAddressRepository;
    private readonly ProductManagement.Application.Common.Interfaces.ICouponRepository _couponRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderHandler(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IOptionRepository optionRepository,
        IUserRepository userRepository,
        IUserAddressRepository userAddressRepository,
        ProductManagement.Application.Common.Interfaces.ICouponRepository couponRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _optionRepository = optionRepository;
        _userRepository = userRepository;
        _userAddressRepository = userAddressRepository;
        _couponRepository = couponRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;

        // validate user exists
        var user = await _userRepository.GetByIdAsync(dto.UserId, cancellationToken);
        if (user == null) throw new InvalidOperationException("User not found");

        if (dto.Items == null || dto.Items.Count == 0) throw new ArgumentException("No items provided");

        decimal total = 0m;
        var orderItems = new List<OrderItem>();

        foreach (var it in dto.Items)
        {
            var product = await _productRepository.GetByIdAsync(it.ProductId, true, cancellationToken);
            if (product == null) throw new InvalidOperationException($"Product {it.ProductId} not found");
            if (product.IsAvailable.HasValue && product.IsAvailable == false) throw new InvalidOperationException($"Product {product.Name} is not available");
            if (product.StockQuantity < it.Quantity) throw new InvalidOperationException($"Sản phẩm '{product.Name}' không đủ số lượng trong kho (còn {product.StockQuantity}).");

            var unitPrice = product.BasePrice;
            decimal itemTotal = unitPrice * it.Quantity;

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = it.Quantity,
                UnitPrice = unitPrice,
                ItemTotalPrice = 0m,
                OrderItemOptions = new List<OrderItemOption>()
            };

            // process selected options (toppings)
            if (it.OptionIds != null && it.OptionIds.Count > 0)
            {
                foreach (var optId in it.OptionIds)
                {
                    var opt = await _optionRepository.GetByIdAsync(optId, cancellationToken);
                    if (opt == null) continue;
                    if (opt.IsAvailable.HasValue && opt.IsAvailable == false) continue;

                    var optionPrice = opt.PriceModifier;
                    itemTotal += optionPrice * it.Quantity;

                    orderItem.OrderItemOptions.Add(new OrderItemOption
                    {
                        Id = Guid.NewGuid(),
                        OptionId = opt.Id,
                        OptionName = opt.Name,
                        OptionPrice = optionPrice
                    });
                }
            }

            orderItem.ItemTotalPrice = itemTotal;
            total += itemTotal;
            orderItems.Add(orderItem);
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderCode = "ORD-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss"),
            UserId = dto.UserId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            ShippingAddress = dto.ShippingAddress,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = "UNPAID",
            Note = dto.Note,
            Subtotal = total,
            ShippingFee = 0m,
            DiscountAmount = 0m,
            TotalAmount = total,
            OrderStatus = "PENDING",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = orderItems
        };
        // Tự động lưu địa chỉ giao hàng vào cơ sở dữ liệu (bảng user_addresses) của khách hàng nếu chưa có
        if (!string.IsNullOrWhiteSpace(dto.ShippingAddress))
        {
            try
            {
                var existingAddresses = await _userAddressRepository.GetByUserIdAsync(dto.UserId, cancellationToken);
                var trimmed = dto.ShippingAddress.Trim();
                var exists = existingAddresses.Any(a =>
                    string.Equals(a.StreetAddress?.Trim(), trimmed, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals($"{a.StreetAddress}, {a.Ward}, {a.District}, {a.City}".Trim(), trimmed, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals($"{a.StreetAddress}, {a.District}, {a.City}".Trim(), trimmed, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals($"{a.StreetAddress}, {a.City}".Trim(), trimmed, StringComparison.OrdinalIgnoreCase));

                if (!exists)
                {
                    var (street, ward, district, city) = ParseAddressComponents(trimmed);
                    var newAddress = new UserAddress
                    {
                        Id = Guid.NewGuid(),
                        UserId = dto.UserId,
                        RecipientName = string.IsNullOrWhiteSpace(dto.CustomerName) ? user.FullName : dto.CustomerName.Trim(),
                        PhoneNumber = string.IsNullOrWhiteSpace(dto.CustomerPhone) ? (user.PhoneNumber ?? "") : dto.CustomerPhone.Trim(),
                        StreetAddress = street,
                        Ward = ward,
                        District = district,
                        City = city,
                        IsDefault = existingAddresses.Count == 0,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _userAddressRepository.AddAsync(newAddress, cancellationToken);
                }
            }
            catch
            {
                // Không làm gián đoạn luồng đặt hàng nếu việc lưu địa chỉ gặp sự cố
            }
        }

        // Use unit of work transaction helper to make operation atomic
        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Atomically deduct stock directly in database to prevent race conditions and overselling
            foreach (var it in dto.Items)
            {
                var deducted = await _productRepository.DeductStockAsync(it.ProductId, it.Quantity, cancellationToken);
                if (!deducted)
                {
                    var prod = await _productRepository.GetByIdAsync(it.ProductId, true, cancellationToken);
                    var prodName = prod?.Name ?? it.ProductId.ToString();
                    var remaining = prod?.StockQuantity ?? 0;
                    throw new InvalidOperationException($"Sản phẩm '{prodName}' không đủ số lượng trong kho (còn {remaining}).");
                }
            }

            // persist order (this will call SaveChanges inside repository implementation)
            await _orderRepository.AddAsync(order, cancellationToken);

            // apply coupon if provided
            if (dto.CouponId.HasValue)
            {
                var discount = await _couponRepository.ApplyCouponAsync(dto.CouponId.Value, dto.UserId, total, cancellationToken);
                order.DiscountAmount = discount;
                order.TotalAmount = Math.Max(0, order.TotalAmount - discount);
                order.CouponId = dto.CouponId;
            }

            // Optionally decrement stock here if product has stock field (not present in schema) - omitted

            // Save any changes made by coupon updates
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var itemsDto = orderItems.Select(oi => new OrderItemDto(
                oi.ProductId ?? Guid.Empty,
                oi.ProductName ?? string.Empty,
                oi.Quantity,
                oi.UnitPrice,
                oi.ItemTotalPrice,
                oi.OrderItemOptions?.Select(o => new OrderItemOptionDto(o.OptionId ?? Guid.Empty, o.OptionName, o.OptionPrice)).ToList()
            )).ToList();

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

    private static (string Street, string? Ward, string? District, string City) ParseAddressComponents(string address)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return ("Chưa có địa chỉ chi tiết", null, null, "Hồ Chí Minh");
        }

        var parts = address.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length >= 4)
        {
            return (
                string.Join(", ", parts.Take(parts.Length - 3)),
                parts[parts.Length - 3],
                parts[parts.Length - 2],
                parts[parts.Length - 1]
            );
        }
        if (parts.Length == 3)
        {
            return (parts[0], null, parts[1], parts[2]);
        }
        if (parts.Length == 2)
        {
            return (parts[0], null, null, parts[1]);
        }
        return (address, null, null, "Hồ Chí Minh");
    }
}
