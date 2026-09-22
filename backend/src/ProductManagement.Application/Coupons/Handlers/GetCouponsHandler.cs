using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Coupons.DTOs;
using ProductManagement.Application.Coupons.Queries;

namespace ProductManagement.Application.Coupons.Handlers;

public class GetCouponsHandler : IRequestHandler<GetCouponsQuery, PagedResult<CouponDto>>
{
    private readonly ICouponRepository _couponRepository;

    public GetCouponsHandler(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<PagedResult<CouponDto>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
    {
        var coupons = await _couponRepository.GetAllAsync(request.Search, request.IsActive, cancellationToken);

        var totalCount = coupons.Count;
        var items = coupons
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ToDto)
            .ToList();

        return new PagedResult<CouponDto>(items, totalCount, request.Page, request.PageSize);
    }

    internal static CouponDto ToDto(Domain.Entities.Coupon c) => new(
        c.Id, c.Code, c.Description, c.DiscountType, c.DiscountValue,
        c.MinOrderAmount, c.MaxDiscountAmount, c.UsageLimit, c.UsedCount,
        c.StartDate, c.EndDate, c.IsActive ?? true, c.CreatedAt);
}
