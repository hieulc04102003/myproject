using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Categories.Handlers;

public class DeleteCategoryHandler : IRequestHandler<ProductManagement.Application.Categories.Commands.DeleteCategoryCommand, bool>
{
    private readonly ICategoryRepository _categoryRepository;

    public DeleteCategoryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<bool> Handle(ProductManagement.Application.Categories.Commands.DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        return await _categoryRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
