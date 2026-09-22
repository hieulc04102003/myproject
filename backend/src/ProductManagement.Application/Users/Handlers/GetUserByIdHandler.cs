using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Users.Handlers;

public class GetUserByIdHandler : IRequestHandler<ProductManagement.Application.Users.Queries.GetUserByIdQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(ProductManagement.Application.Users.Queries.GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null) return null;

        // RBAC: nạp vai trò từ bảng user_roles
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        return new UserDto(user.Id, user.FullName, user.Email, user.PhoneNumber, user.Role, user.IsActive, user.CreatedAt, user.UpdatedAt, user.IsPhoneVerified);
    }
}
