using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class CouponRepository : ICouponRepository
{
    private readonly MyProjectContext _context;

    public CouponRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task<decimal> ApplyCouponAsync(Guid couponId, Guid userId, decimal orderTotal, CancellationToken cancellationToken = default)
    {
        var coupon = await _context.Coupons.FindAsync(new object[] { couponId }, cancellationToken);
        if (coupon == null) throw new InvalidOperationException("Coupon not found");

        var now = DateTime.UtcNow;
        if (coupon.IsActive.HasValue && coupon.IsActive == false) throw new InvalidOperationException("Coupon is not active");
        if (now < coupon.StartDate || now > coupon.EndDate) throw new InvalidOperationException("Coupon is not valid at this time");
        if (coupon.MinOrderAmount.HasValue && orderTotal < coupon.MinOrderAmount.Value) throw new InvalidOperationException($"Order amount does not meet coupon minimum of {coupon.MinOrderAmount.Value}");
        if (coupon.UsageLimit.HasValue && coupon.UsedCount.GetValueOrDefault() >= coupon.UsageLimit.Value) throw new InvalidOperationException("Coupon usage limit reached");

        // compute discount
        decimal discount = 0m;
        var dtype = (coupon.DiscountType ?? string.Empty).ToLowerInvariant();
        if (dtype.Contains("percent") || dtype.Contains("%") )
        {
            discount = orderTotal * coupon.DiscountValue / 100m;
        }
        else
        {
            discount = coupon.DiscountValue;
        }
        if (coupon.MaxDiscountAmount.HasValue)
        {
            discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
        }

        // update coupon usage and counters
        coupon.UsedCount = coupon.UsedCount.GetValueOrDefault() + 1;

        var usage = new CouponUsage
        {
            Id = Guid.NewGuid(),
            CouponId = coupon.Id,
            UserId = userId,
            UsedAt = DateTime.UtcNow
        };
        _context.CouponUsages.Add(usage);

        await _context.SaveChangesAsync(cancellationToken);

        return discount;
    }

    public async Task<List<Coupon>> GetAllAsync(string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Coupons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c => c.Code.ToLower().Contains(term) || (c.Description != null && c.Description.ToLower().Contains(term)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Coupon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);
    }

    public async Task<Coupon> AddAsync(Coupon coupon, CancellationToken cancellationToken = default)
    {
        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return coupon;
    }

    public async Task<Coupon> UpdateAsync(Coupon coupon, CancellationToken cancellationToken = default)
    {
        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return coupon;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var coupon = await GetByIdAsync(id, cancellationToken);
        if (coupon == null) return false;

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
