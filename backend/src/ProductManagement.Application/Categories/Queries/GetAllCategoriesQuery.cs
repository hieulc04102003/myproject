using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Categories.Queries;

public record GetAllCategoriesQuery() : IRequest<List<CategoryDto>>;
