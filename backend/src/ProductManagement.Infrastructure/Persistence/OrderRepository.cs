using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class OrderRepository : IOrderRepository
{
    private readonly MyProjectContext _context;

    public OrderRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.OrderItemOptions)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<(List<Order> Items, int TotalCount)> GetPagedAsync(Guid? userId, int page, int pageSize, string? status = null, DateTime? from = null, DateTime? to = null, string? orderCode = null, CancellationToken cancellationToken = default)
    {
        var q = _context.Orders.AsQueryable();
        if (userId.HasValue)
        {
            q = q.Where(o => o.UserId == userId.Value);
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            var cleanStatus = status.Trim().ToUpperInvariant();
            if (cleanStatus == "SHIPPED" || cleanStatus == "SHIPPING")
            {
                q = q.Where(o => o.OrderStatus == "SHIPPED" || o.OrderStatus == "SHIPPING");
            }
            else
            {
                q = q.Where(o => o.OrderStatus.ToUpper() == cleanStatus);
            }
        }

        if (from.HasValue)
        {
            q = q.Where(o => o.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            q = q.Where(o => o.CreatedAt <= to.Value);
        }

        if (!string.IsNullOrWhiteSpace(orderCode))
        {
            q = q.Where(o => o.OrderCode.Contains(orderCode));
        }

        var total = await q.CountAsync(cancellationToken);

        var skip = Math.Max(0, (page - 1)) * pageSize;
        var items = await q
            .OrderByDescending(o => o.CreatedAt)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemOptions)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
