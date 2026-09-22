using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Coupons.DTOs;
using ProductManagement.Application.Coupons.Queries;

namespace ProductManagement.Application.Coupons.Handlers;

public class GetCouponByIdHandler : IRequestHandler<GetCouponByIdQuery, CouponDto?>
{
    private readonly ICouponRepository _couponRepository;

    public GetCouponByIdHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponDto?> Handle(GetCouponByIdQuery request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepository.GetByIdAsync(request.Id, cancellationToken);
        if (coupon == null) return null;

        return GetCouponsHandler.ToDto(coupon);
    }
}

public class ValidateCouponHandler : IRequestHandler<ValidateCouponQuery, CouponValidationResultDto>
{
    private readonly ICouponRepository _couponRepository;

    public ValidateCouponHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<CouponValidationResultDto> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var coupon = await _couponRepository.GetByCodeAsync(request.Code.Trim(), cancellationToken);
        var now = DateTime.UtcNow;

        if (coupon == null)
            return new CouponValidationResultDto(false, "Mã giảm giá không tồn tại", null, null, 0, request.OrderTotal);
        if (coupon.IsActive == false)
            return new CouponValidationResultDto(false, "Mã giảm giá đã bị vô hiệu hóa", null, coupon.Code, 0, request.OrderTotal);
        if (now < coupon.StartDate)
            return new CouponValidationResultDto(false, "Mã giảm giá chưa có hiệu lực", null, coupon.Code, 0, request.OrderTotal);
        if (now > coupon.EndDate)
            return new CouponValidationResultDto(false, "Mã giảm giá đã hết hạn", null, coupon.Code, 0, request.OrderTotal);
        if (coupon.MinOrderAmount.HasValue && request.OrderTotal < coupon.MinOrderAmount.Value)
            return new CouponValidationResultDto(false, $"Đơn hàng tối thiểu {coupon.MinOrderAmount.Value:N0}đ để dùng mã này", null, coupon.Code, 0, request.OrderTotal);
        if (coupon.UsageLimit.HasValue && coupon.UsedCount.GetValueOrDefault() >= coupon.UsageLimit.Value)
            return new CouponValidationResultDto(false, "Mã giảm giá đã hết lượt sử dụng", null, coupon.Code, 0, request.OrderTotal);

        decimal discount;
        var dtype = (coupon.DiscountType ?? string.Empty).ToLowerInvariant();
        if (dtype.Contains("percent") || dtype.Contains("%"))
            discount = request.OrderTotal * coupon.DiscountValue / 100m;
        else
            discount = coupon.DiscountValue;

        if (coupon.MaxDiscountAmount.HasValue)
            discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);

        discount = Math.Min(discount, request.OrderTotal);
        var totalAfter = request.OrderTotal - discount;

        return new CouponValidationResultDto(true, "Áp dụng mã giảm giá thành công", coupon.Id, coupon.Code, discount, totalAfter);
    }
}

/// <summary>
/// Get all currently valid coupons for public display (homepage voucher bar).
/// Returns only isActive coupons within their valid date range and under usage limit.
/// </summary>
public class GetActiveCouponsHandler : IRequestHandler<GetActiveCouponsQuery, List<CouponDto>>
{
    private readonly ICouponRepository _couponRepository;

    public GetActiveCouponsHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<List<CouponDto>> Handle(GetActiveCouponsQuery request, CancellationToken cancellationToken)
    {
        var coupons = await _couponRepository.GetAllAsync(null, null, cancellationToken);
        var now = DateTime.UtcNow;

        return coupons
            .Where(c => c.IsActive == true
                && c.StartDate <= now
                && c.EndDate >= now
                && (!c.UsageLimit.HasValue || (c.UsedCount ?? 0) < c.UsageLimit.Value))
            .OrderBy(c => c.EndDate)
            .Select(GetCouponsHandler.ToDto)
            .ToList();
    }
}
