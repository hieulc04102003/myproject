using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(List<Order> Items, int TotalCount)> GetPagedAsync(Guid? userId, int page, int pageSize, string? status = null, DateTime? from = null, DateTime? to = null, string? orderCode = null, CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
}
