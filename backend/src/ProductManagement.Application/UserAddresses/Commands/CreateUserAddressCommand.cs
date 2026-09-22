using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.UserAddresses.Commands;

/// <summary>
/// Command thêm một địa chỉ giao hàng mới cho người dùng hiện tại.
/// </summary>
public record CreateUserAddressCommand(
    Guid UserId,
    string RecipientName,
    string PhoneNumber,
    string StreetAddress,
    string? Ward,
    string? District,
    string? City,
    bool IsDefault
) : IRequest<UserAddressDto>;
