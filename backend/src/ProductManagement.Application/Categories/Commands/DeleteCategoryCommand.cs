using MediatR;

namespace ProductManagement.Application.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest<bool>;
