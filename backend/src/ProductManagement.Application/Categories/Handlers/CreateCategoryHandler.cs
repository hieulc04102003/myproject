using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Categories.Handlers;

public class CreateCategoryHandler : IRequestHandler<ProductManagement.Application.Categories.Commands.CreateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;

    public CreateCategoryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<CategoryDto> Handle(ProductManagement.Application.Categories.Commands.CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _categoryRepository.AddAsync(category, cancellationToken);

        return new CategoryDto(created.Id, created.Name, created.Slug, created.Description, created.DisplayOrder, created.IsActive, created.CreatedAt);
    }
}
