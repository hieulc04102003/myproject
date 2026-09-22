using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface ICouponRepository
{
    /// <summary>
    /// Validate coupon and record usage, returning the discount amount to apply for the given order total.
    /// Throws InvalidOperationException for invalid or inapplicable coupons.
    /// </summary>
    Task<decimal> ApplyCouponAsync(Guid couponId, Guid userId, decimal orderTotal, CancellationToken cancellationToken = default);

    Task<List<Coupon>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Coupon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<Coupon> AddAsync(Coupon coupon, CancellationToken cancellationToken = default);
    Task<Coupon> UpdateAsync(Coupon coupon, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
