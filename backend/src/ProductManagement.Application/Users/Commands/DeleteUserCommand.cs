using MediatR;

namespace ProductManagement.Application.Users.Commands;

public record DeleteUserCommand(Guid Id) : IRequest<bool>;
