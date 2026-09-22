using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Categories.Handlers;

public class GetAllCategoriesHandler : IRequestHandler<ProductManagement.Application.Categories.Queries.GetAllCategoriesQuery, List<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetAllCategoriesHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> Handle(ProductManagement.Application.Categories.Queries.GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var cats = await _categoryRepository.GetAllAsync(cancellationToken);
        return cats.Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.DisplayOrder, c.IsActive, c.CreatedAt)).ToList();
    }
}
