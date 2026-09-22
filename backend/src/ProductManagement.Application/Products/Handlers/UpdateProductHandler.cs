using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Products.Handlers;

public class UpdateProductHandler : IRequestHandler<ProductManagement.Application.Products.Commands.UpdateProductCommand, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductDto?> Handle(ProductManagement.Application.Products.Commands.UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var existing = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null) return null;

        existing.Name = request.Name;
        existing.CategoryId = request.CategoryId;
        existing.Slug = request.Slug;
        existing.Description = request.Description;
        existing.BasePrice = request.BasePrice;
        existing.IsAvailable = request.IsAvailable;
        existing.IsFeatured = request.IsFeatured;
        existing.StockQuantity = request.StockQuantity;
        existing.UpdatedAt = DateTime.UtcNow;

        if (request.OptionGroupIds != null)
        {
            existing.ProductOptionGroups.Clear();
            int order = 0;
            foreach (var gid in request.OptionGroupIds.Distinct())
            {
                existing.ProductOptionGroups.Add(new ProductOptionGroup
                {
                    ProductId = existing.Id,
                    OptionGroupId = gid,
                    DisplayOrder = order++
                });
            }
        }

        // repository uses DbContext tracking; just save changes via unit of work
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductDto(existing.Id, existing.Name, existing.Slug, existing.CategoryId, existing.Category?.Name, existing.BasePrice, existing.ImageUrl, existing.IsAvailable, existing.IsFeatured, existing.StockQuantity);
    }
}
