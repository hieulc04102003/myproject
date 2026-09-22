using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Queries;

/// <summary>
/// Query lấy thông tin hồ sơ của người dùng đang đăng nhập theo userId từ JWT.
/// </summary>
public record GetUserProfileQuery(Guid UserId) : IRequest<UserDto?>;
