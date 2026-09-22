using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Users.Commands;

namespace ProductManagement.Application.Users.Handlers;

public class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null) return null;

        // Kiểm tra email nếu có thay đổi
        var cleanEmail = request.Email?.Trim();
        if (!string.IsNullOrWhiteSpace(cleanEmail) &&
            !string.Equals(user.Email, cleanEmail, StringComparison.OrdinalIgnoreCase))
        {
            var existingByEmail = await _userRepository.GetByEmailAsync(cleanEmail, cancellationToken);
            if (existingByEmail != null && existingByEmail.Id != user.Id)
                throw new InvalidOperationException("Địa chỉ email này đã được sử dụng bởi một tài khoản khác.");

            user.Email = cleanEmail;
        }

        // Kiểm tra số điện thoại nếu có thay đổi
        var cleanPhone = request.PhoneNumber?.Trim();
        if (!string.IsNullOrWhiteSpace(cleanPhone) &&
            !string.Equals(user.PhoneNumber, cleanPhone, StringComparison.OrdinalIgnoreCase))
        {
            var existingByPhone = await _userRepository.GetByPhoneNumberAsync(cleanPhone, cancellationToken);
            if (existingByPhone != null && existingByPhone.Id != user.Id)
                throw new InvalidOperationException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");

            user.PhoneNumber = cleanPhone;
        }

        user.FullName = request.FullName.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);

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
