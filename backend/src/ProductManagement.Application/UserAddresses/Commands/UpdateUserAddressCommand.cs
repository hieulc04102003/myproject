using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.UserAddresses.Commands;

/// <summary>
/// Command cập nhật thông tin một địa chỉ giao hàng.
/// Trả về null nếu không tìm thấy hoặc địa chỉ không thuộc về UserId được cung cấp.
/// </summary>
public record UpdateUserAddressCommand(
    Guid UserId,
    Guid AddressId,
    string RecipientName,
    string PhoneNumber,
    string StreetAddress,
    string? Ward,
    string? District,
    string? City,
    bool IsDefault
) : IRequest<UserAddressDto?>;
