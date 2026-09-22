using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IProductRepository
{
    /// <summary>
    /// Get featured products with pagination and sorting.
    /// </summary>
    Task<(List<Product> Items, int TotalCount)> GetFeaturedAsync(
        int page,
        int pageSize,
        string? sortBy = null,
        string? sortDir = null,
        CancellationToken cancellationToken = default);

    Task<ProductManagement.Domain.Entities.Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductManagement.Domain.Entities.Product?> GetByIdAsync(Guid id, bool asNoTracking, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically deduct stock quantity for a product if sufficient stock exists.
    /// Returns true if stock was successfully deducted; false if insufficient stock or product not found.
    /// </summary>
    Task<bool> DeductStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically restore stock quantity for a product (e.g. when an order is cancelled).
    /// </summary>
    Task RestoreStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new product to the store. The unit of work's SaveChangesAsync should be called to persist.
    /// </summary>
    Task AddAsync(ProductManagement.Domain.Entities.Product product, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a product by id. Does nothing if product does not exist.
    /// The unit of work's SaveChangesAsync should be called to persist.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search products by name or description with pagination and sorting.
    /// </summary>
    Task<(List<Product> Items, int TotalCount)> SearchAsync(
        string? query,
        Guid? categoryId,
        string? slug,
        bool? isAvailable,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
        int pageSize,
        string? sortBy = null,
        string? sortDir = null,
        CancellationToken cancellationToken = default);
}
