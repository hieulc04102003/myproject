using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Commands;

/// <summary>
/// Admin-created user. Password is required and will be hashed.
/// Returns created UserDto.
/// </summary>
public record CreateUserCommand(string FullName, string Email, string PhoneNumber, string Password, string Role, bool IsActive) : IRequest<ProductManagement.Application.Common.Dto.UserDto>;
