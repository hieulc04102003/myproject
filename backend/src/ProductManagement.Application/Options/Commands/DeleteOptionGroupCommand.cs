using MediatR;

namespace ProductManagement.Application.Options.Commands;

public record DeleteOptionGroupCommand(Guid Id) : IRequest<bool>;
