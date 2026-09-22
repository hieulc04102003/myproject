using MediatR;

namespace ProductManagement.Application.Options.Commands;

public record DeleteOptionCommand(Guid Id) : IRequest<bool>;
