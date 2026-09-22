using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Products.Handlers;

public class DeleteProductHandler : IRequestHandler<ProductManagement.Application.Products.Commands.DeleteProductCommand, bool>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ProductManagement.Application.Products.Commands.DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var existing = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null) return false;

        await _productRepository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
