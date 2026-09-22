using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Coupons.DTOs;
using ProductManagement.Application.Coupons.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Coupons.Handlers;

public class CreateCouponHandler : IRequestHandler<CreateCouponCommand, CouponDto>
{
    private readonly ICouponRepository _couponRepository;

    public CreateCouponHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponDto> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();

        // DB check constraint chỉ chấp nhận 'FIXED_AMOUNT' | 'PERCENTAGE'
        var rawType = (request.DiscountType ?? string.Empty).Trim();
        var discountType = rawType.ToLowerInvariant().Contains("percent") ? "PERCENTAGE" : "FIXED_AMOUNT";

        var existing = await _couponRepository.GetByCodeAsync(code, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException($"Mã giảm giá '{code}' đã tồn tại");

        if (request.EndDate < request.StartDate)
            throw new InvalidOperationException("Ngày kết thúc phải sau ngày bắt đầu");

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = code,
            Description = request.Description,
            DiscountType = discountType,
            DiscountValue = request.DiscountValue,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            // DB dùng 'timestamp with time zone' -> bắt buộc DateTime phải là UTC Kind
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _couponRepository.AddAsync(coupon, cancellationToken);
        return GetCouponsHandler.ToDto(created);
    }
}
