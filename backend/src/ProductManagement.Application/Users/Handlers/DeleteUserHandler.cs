using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Users.Handlers;

public class DeleteUserHandler : IRequestHandler<ProductManagement.Application.Users.Commands.DeleteUserCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public DeleteUserHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ProductManagement.Application.Users.Commands.DeleteUserCommand request, CancellationToken cancellationToken)
    {
        return await _userRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
