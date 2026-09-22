using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Coupons.DTOs;
using ProductManagement.Application.Coupons.Commands;

namespace ProductManagement.Application.Coupons.Handlers;

public class UpdateCouponHandler : IRequestHandler<UpdateCouponCommand, CouponDto?>
{
    private readonly ICouponRepository _couponRepository;

    public UpdateCouponHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponDto?> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepository.GetByIdAsync(request.Id, cancellationToken);
        if (coupon == null) return null;

        if (request.EndDate < request.StartDate)
            throw new InvalidOperationException("Ngày kết thúc phải sau ngày bắt đầu");

        coupon.Description = request.Description;
        // DB check constraint chỉ chấp nhận 'FIXED_AMOUNT' | 'PERCENTAGE'
        var rawType = (request.DiscountType ?? string.Empty).Trim();
        coupon.DiscountType = rawType.ToLowerInvariant().Contains("percent") ? "PERCENTAGE" : "FIXED_AMOUNT";
        coupon.DiscountValue = request.DiscountValue;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.UsageLimit = request.UsageLimit;
        // DB dùng 'timestamp with time zone' -> bắt buộc DateTime phải là UTC Kind
        coupon.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        coupon.EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);
        coupon.IsActive = request.IsActive;

        var updated = await _couponRepository.UpdateAsync(coupon, cancellationToken);
        return GetCouponsHandler.ToDto(updated);
    }
}

public class DeleteCouponHandler : IRequestHandler<DeleteCouponCommand, bool>
{
    private readonly ICouponRepository _couponRepository;

    public DeleteCouponHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<bool> Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
    {
        return await _couponRepository.DeleteAsync(request.Id, cancellationToken);
    }
}

public class ToggleCouponStatusHandler : IRequestHandler<ToggleCouponStatusCommand, CouponDto?>
{
    private readonly ICouponRepository _couponRepository;

    public ToggleCouponStatusHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponDto?> Handle(ToggleCouponStatusCommand request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepository.GetByIdAsync(request.Id, cancellationToken);
        if (coupon == null) return null;

        coupon.IsActive = !(coupon.IsActive ?? true);
        var updated = await _couponRepository.UpdateAsync(coupon, cancellationToken);
        return GetCouponsHandler.ToDto(updated);
    }
}
