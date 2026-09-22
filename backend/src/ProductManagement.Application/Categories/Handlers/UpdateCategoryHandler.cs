using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Categories.Handlers;

public class UpdateCategoryHandler : IRequestHandler<ProductManagement.Application.Categories.Commands.UpdateCategoryCommand, CategoryDto?>
{
    private readonly ICategoryRepository _categoryRepository;

    public UpdateCategoryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<CategoryDto?> Handle(ProductManagement.Application.Categories.Commands.UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null) return null;

        existing.Name = request.Name;
        existing.Slug = request.Slug;
        existing.Description = request.Description;
        existing.DisplayOrder = request.DisplayOrder;
        existing.IsActive = request.IsActive;

        var updated = await _categoryRepository.UpdateAsync(existing, cancellationToken);

        return new CategoryDto(updated.Id, updated.Name, updated.Slug, updated.Description, updated.DisplayOrder, updated.IsActive, updated.CreatedAt);
    }
}
