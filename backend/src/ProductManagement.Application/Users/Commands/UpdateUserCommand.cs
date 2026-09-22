using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Commands;

/// <summary>
/// Admin-updated user fields. Password optional; when provided it will be hashed.
/// Returns updated UserDto or null if not found.
/// </summary>
public record UpdateUserCommand(System.Guid Id, string FullName, string? Email, string? PhoneNumber, string? Password, string Role, bool IsActive) : IRequest<ProductManagement.Application.Common.Dto.UserDto?>;
