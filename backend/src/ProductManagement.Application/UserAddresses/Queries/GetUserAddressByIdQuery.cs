using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.UserAddresses.Queries;

/// <summary>
/// Query lấy chi tiết một địa chỉ giao hàng theo Id.
/// Trả về null nếu không tìm thấy hoặc địa chỉ không thuộc về UserId được cung cấp.
/// </summary>
public record GetUserAddressByIdQuery(Guid UserId, Guid AddressId) : IRequest<UserAddressDto?>;
