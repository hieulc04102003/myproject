using MediatR;

namespace ProductManagement.Application.UserAddresses.Commands;

/// <summary>
/// Command đặt một địa chỉ làm mặc định cho người dùng.
/// Trả về false nếu không tìm thấy hoặc địa chỉ không thuộc về UserId được cung cấp.
/// </summary>
public record SetDefaultAddressCommand(Guid UserId, Guid AddressId) : IRequest<bool>;
