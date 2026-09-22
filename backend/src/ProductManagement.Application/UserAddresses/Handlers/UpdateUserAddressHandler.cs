using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.UserAddresses.Commands;

namespace ProductManagement.Application.UserAddresses.Handlers;

public class UpdateUserAddressHandler : IRequestHandler<UpdateUserAddressCommand, UserAddressDto?>
{
    private readonly IUserAddressRepository _addressRepository;

    public UpdateUserAddressHandler(IUserAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<UserAddressDto?> Handle(UpdateUserAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.AddressId, cancellationToken);

        // Trả về null nếu không tìm thấy hoặc địa chỉ không thuộc người dùng hiện tại
        if (address == null || address.UserId != request.UserId)
            return null;

        var city = string.IsNullOrWhiteSpace(request.City) ? "Hồ Chí Minh" : request.City.Trim();

        address.RecipientName = request.RecipientName.Trim();
        address.PhoneNumber = request.PhoneNumber.Trim();
        address.StreetAddress = request.StreetAddress.Trim();
        address.Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim();
        address.District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim();
        address.City = city;
        address.IsDefault = request.IsDefault;

        await _addressRepository.UpdateAsync(address, cancellationToken);
        return GetMyAddressesHandler.MapToDto(address);
    }
}
