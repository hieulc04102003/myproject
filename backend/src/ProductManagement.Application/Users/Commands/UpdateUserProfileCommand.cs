using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Commands;

/// <summary>
/// Command cập nhật hồ sơ cá nhân của người dùng đang đăng nhập.
/// Không cho phép thay đổi mật khẩu hay vai trò tại đây.
/// </summary>
public record UpdateUserProfileCommand(
    Guid UserId,
    string FullName,
    string? Email,
    string? PhoneNumber
) : IRequest<UserDto?>;
