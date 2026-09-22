using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class UpdateProductAvailabilityHandler : IRequestHandler<ProductManagement.Application.Products.Commands.UpdateProductAvailabilityCommand, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductAvailabilityHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductDto?> Handle(ProductManagement.Application.Products.Commands.UpdateProductAvailabilityCommand request, CancellationToken cancellationToken)
    {
        var existing = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null) return null;

        if (request.IsAvailable.HasValue) existing.IsAvailable = request.IsAvailable.Value;
        if (request.IsFeatured.HasValue) existing.IsFeatured = request.IsFeatured.Value;
        existing.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductDto(existing.Id, existing.Name, existing.Slug, existing.CategoryId, existing.Category?.Name, existing.BasePrice, existing.ImageUrl, existing.IsAvailable, existing.IsFeatured, existing.StockQuantity);
    }
}
