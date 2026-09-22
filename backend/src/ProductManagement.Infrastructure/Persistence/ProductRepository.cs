using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class ProductRepository : IProductRepository
{
    private readonly MyProjectContext _context;

    public ProductRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task<(List<Product> Items, int TotalCount)> GetFeaturedAsync(int page, int pageSize, string? sortBy = null, string? sortDir = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsFeatured == true && (p.IsAvailable == null || p.IsAvailable == true));

        // total count before pagination
        var total = await query.CountAsync(cancellationToken);

        // Sorting
        var direction = (sortDir ?? "desc").ToLowerInvariant();
        IQueryable<Product> ordered = sortBy?.ToLowerInvariant() switch
        {
            "price" => direction == "asc" ? query.OrderBy(p => p.BasePrice) : query.OrderByDescending(p => p.BasePrice),
            "name" => direction == "asc" ? query.OrderBy(p => p.Name) : query.OrderByDescending(p => p.Name),
            "updatedat" => direction == "asc" ? query.OrderBy(p => p.UpdatedAt) : query.OrderByDescending(p => p.UpdatedAt),
            _ => query.OrderByDescending(p => p.UpdatedAt)
        };

        var skip = Math.Max(0, (page - 1)) * pageSize;

        var items = await ordered.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return GetByIdAsync(id, false, cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(Guid id, bool asNoTracking, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductOptionGroups.OrderBy(pog => pog.DisplayOrder))
                .ThenInclude(pog => pog.OptionGroup)
                    .ThenInclude(og => og.Options.OrderBy(o => o.DisplayOrder))
            .AsQueryable();
        if (asNoTracking)
        {
            query = query.AsNoTracking();
        }
        return await query.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<bool> DeductStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default)
    {
        var affected = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE products SET stock_quantity = stock_quantity - {quantity} WHERE id = {productId} AND stock_quantity >= {quantity};",
            cancellationToken);

        return affected > 0;
    }

    public async Task RestoreStockAsync(Guid productId, int quantity, CancellationToken cancellationToken = default)
    {
        await _context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE products SET stock_quantity = stock_quantity + {quantity} WHERE id = {productId};",
            cancellationToken);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var prod = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (prod != null)
        {
            _context.Products.Remove(prod);
        }
    }

    public async Task<(List<Product> Items, int TotalCount)> SearchAsync(string? query, Guid? categoryId, string? slug, bool? isAvailable, decimal? minPrice, decimal? maxPrice, int page, int pageSize, string? sortBy = null, string? sortDir = null, CancellationToken cancellationToken = default)
    {
        var q = _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductOptionGroups.OrderBy(pog => pog.DisplayOrder))
                .ThenInclude(pog => pog.OptionGroup)
                    .ThenInclude(og => og.Options.OrderBy(o => o.DisplayOrder))
            .AsQueryable();

        if (categoryId.HasValue)
        {
            q = q.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(slug))
        {
            q = q.Where(p => p.Slug == slug);
        }

        if (isAvailable.HasValue)
        {
            q = q.Where(p => p.IsAvailable == isAvailable.Value);
        }

        if (minPrice.HasValue)
            q = q.Where(p => p.BasePrice >= minPrice.Value);
        if (maxPrice.HasValue)
            q = q.Where(p => p.BasePrice <= maxPrice.Value);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var qTerm = query.Trim();
            q = q.Where(p => EF.Functions.ILike(p.Name, $"%{qTerm}%") || (p.Description != null && EF.Functions.ILike(p.Description, $"%{qTerm}%")));
        }

        var total = await q.CountAsync(cancellationToken);

        var direction = (sortDir ?? "desc").ToLowerInvariant();
        IQueryable<Product> ordered = sortBy?.ToLowerInvariant() switch
        {
            "price" => direction == "asc" ? q.OrderBy(p => p.BasePrice) : q.OrderByDescending(p => p.BasePrice),
            "name" => direction == "asc" ? q.OrderBy(p => p.Name) : q.OrderByDescending(p => p.Name),
            "updatedat" => direction == "asc" ? q.OrderBy(p => p.UpdatedAt) : q.OrderByDescending(p => p.UpdatedAt),
            _ => q.OrderByDescending(p => p.UpdatedAt)
        };

        var skip = Math.Max(0, (page - 1)) * pageSize;
        var items = await ordered.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);

        return (items, total);
    }
}
