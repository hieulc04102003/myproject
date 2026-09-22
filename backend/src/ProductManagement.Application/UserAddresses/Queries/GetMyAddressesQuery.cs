using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.UserAddresses.Queries;

/// <summary>
/// Query lấy danh sách địa chỉ giao hàng của người dùng hiện tại.
/// </summary>
public record GetMyAddressesQuery(Guid UserId) : IRequest<IReadOnlyList<UserAddressDto>>;
