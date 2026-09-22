using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.UserAddresses.Queries;

namespace ProductManagement.Application.UserAddresses.Handlers;

public class GetUserAddressByIdHandler : IRequestHandler<GetUserAddressByIdQuery, UserAddressDto?>
{
    private readonly IUserAddressRepository _addressRepository;

    public GetUserAddressByIdHandler(IUserAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<UserAddressDto?> Handle(GetUserAddressByIdQuery request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.AddressId, cancellationToken);

        // Trả về null nếu không tìm thấy hoặc địa chỉ không thuộc người dùng hiện tại
        if (address == null || address.UserId != request.UserId)
            return null;

        return GetMyAddressesHandler.MapToDto(address);
    }
}
