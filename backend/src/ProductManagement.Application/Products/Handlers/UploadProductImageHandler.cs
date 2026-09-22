using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Products.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Products.Handlers;

public class UploadProductImageHandler : IRequestHandler<UploadProductImageCommand, string>
{
    private readonly IImageService _imageService;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadProductImageHandler(IImageService imageService, IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _imageService = imageService;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<string> Handle(UploadProductImageCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null) throw new InvalidOperationException("Product not found");

        // upload to cloud
        using var ms = new System.IO.MemoryStream(request.FileContent);
        var url = await _imageService.UploadAsync(ms, request.FileName, cancellationToken);

        product.ImageUrl = url;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return url;
    }
}
