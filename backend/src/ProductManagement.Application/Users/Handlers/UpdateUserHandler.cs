using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Users.Handlers;

public class UpdateUserHandler : IRequestHandler<ProductManagement.Application.Users.Commands.UpdateUserCommand, UserDto?>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UpdateUserHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto?> Handle(ProductManagement.Application.Users.Commands.UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null) return null;

        existing.FullName = request.FullName;
        if (!string.IsNullOrWhiteSpace(request.Email)) existing.Email = request.Email;
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber)) existing.PhoneNumber = request.PhoneNumber;
        if (!string.IsNullOrWhiteSpace(request.Password)) existing.PasswordHash = _passwordHasher.Hash(request.Password);
        existing.IsActive = request.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(existing, cancellationToken);

        // RBAC: nếu đổi role thì cập nhật user_roles
        if (!string.IsNullOrWhiteSpace(request.Role) && request.Role != existing.Role)
        {
            await _userRepository.AssignRoleAsync(existing.Id, request.Role, replace: true, cancellationToken);
        }
        await _userRepository.LoadRolesAsync(existing, cancellationToken);

        return new UserDto(existing.Id, existing.FullName, existing.Email, existing.PhoneNumber ?? string.Empty, existing.Role, existing.IsActive, existing.CreatedAt, existing.UpdatedAt, existing.IsPhoneVerified);
    }
}
