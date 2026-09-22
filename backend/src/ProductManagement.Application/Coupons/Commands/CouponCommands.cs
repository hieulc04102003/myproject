using MediatR;
using ProductManagement.Application.Coupons.DTOs;

namespace ProductManagement.Application.Coupons.Commands;

public record CreateCouponCommand(
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive
) : IRequest<CouponDto>;

public record UpdateCouponCommand(
    Guid Id,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive
) : IRequest<CouponDto?>;

public record DeleteCouponCommand(Guid Id) : IRequest<bool>;

public record ToggleCouponStatusCommand(Guid Id) : IRequest<CouponDto?>;
