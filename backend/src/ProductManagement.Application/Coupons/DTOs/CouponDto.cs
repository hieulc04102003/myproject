namespace ProductManagement.Application.Coupons.DTOs;

public record CouponDto(
    Guid Id,
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int? UsedCount,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    DateTime CreatedAt
);

public record CouponValidationResultDto(
    bool IsValid,
    string? Message,
    Guid? CouponId,
    string? Code,
    decimal DiscountAmount,
    decimal OrderTotalAfterDiscount
);
