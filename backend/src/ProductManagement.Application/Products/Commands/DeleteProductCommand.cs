using MediatR;

namespace ProductManagement.Application.Products.Commands;

public record DeleteProductCommand(Guid Id) : IRequest<bool>;
