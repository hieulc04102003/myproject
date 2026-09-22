using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Users.Queries;

namespace ProductManagement.Application.Users.Handlers;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null) return null;

        // RBAC: nạp vai trò từ bảng user_roles
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        return new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt,
            user.IsPhoneVerified
        );
    }
}
