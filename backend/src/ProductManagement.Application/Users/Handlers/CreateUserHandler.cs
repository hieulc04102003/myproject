using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Users.Handlers;

public class CreateUserHandler : IRequestHandler<ProductManagement.Application.Users.Commands.CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto> Handle(ProductManagement.Application.Users.Commands.CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.Hash(request.Password),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        // RBAC: gán vai trò qua bảng user_roles
        await _userRepository.AssignRoleAsync(user.Id, request.Role ?? "CUSTOMER", replace: true, cancellationToken);
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        return new UserDto(user.Id, user.FullName, user.Email, user.PhoneNumber ?? string.Empty, user.Role, user.IsActive, user.CreatedAt, user.UpdatedAt, user.IsPhoneVerified);
    }
}
