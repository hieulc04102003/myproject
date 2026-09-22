using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Products.Handlers;

public class CreateProductHandler : IRequestHandler<ProductManagement.Application.Products.Commands.CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductDto> Handle(ProductManagement.Application.Products.Commands.CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            BasePrice = request.BasePrice,
            IsAvailable = request.IsAvailable,
            IsFeatured = request.IsFeatured,
            StockQuantity = request.StockQuantity,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.OptionGroupIds != null && request.OptionGroupIds.Any())
        {
            int order = 0;
            product.ProductOptionGroups = request.OptionGroupIds.Distinct().Select(gid => new ProductOptionGroup
            {
                ProductId = product.Id,
                OptionGroupId = gid,
                DisplayOrder = order++
            }).ToList();
        }

        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductDto(product.Id, product.Name, product.Slug, product.CategoryId, product.Category?.Name, product.BasePrice, product.ImageUrl, product.IsAvailable, product.IsFeatured, product.StockQuantity);
    }
}
