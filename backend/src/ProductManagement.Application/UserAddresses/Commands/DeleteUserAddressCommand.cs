using MediatR;

namespace ProductManagement.Application.UserAddresses.Commands;

/// <summary>
/// Command xóa một địa chỉ giao hàng.
/// Trả về false nếu không tìm thấy hoặc địa chỉ không thuộc về UserId được cung cấp.
/// </summary>
public record DeleteUserAddressCommand(Guid UserId, Guid AddressId) : IRequest<bool>;
