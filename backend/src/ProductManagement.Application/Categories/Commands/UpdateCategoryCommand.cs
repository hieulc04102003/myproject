using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Categories.Commands;

public record UpdateCategoryCommand(Guid Id, string Name, string Slug, string? Description, int? DisplayOrder, bool? IsActive) : IRequest<CategoryDto?>;
