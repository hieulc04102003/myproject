using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Coupons.DTOs;

namespace ProductManagement.Application.Coupons.Queries;

public record GetCouponsQuery(string? Search = null, bool? IsActive = null, int Page = 1, int PageSize = 20)
    : IRequest<PagedResult<CouponDto>>;

public record GetCouponByIdQuery(Guid Id) : IRequest<CouponDto?>;

public record ValidateCouponQuery(string Code, decimal OrderTotal) : IRequest<CouponValidationResultDto>;

public record GetActiveCouponsQuery() : IRequest<List<CouponDto>>;
