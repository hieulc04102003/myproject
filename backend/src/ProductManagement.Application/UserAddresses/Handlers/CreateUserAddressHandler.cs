using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.UserAddresses.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.UserAddresses.Handlers;

public class CreateUserAddressHandler : IRequestHandler<CreateUserAddressCommand, UserAddressDto>
{
    private readonly IUserAddressRepository _addressRepository;

    public CreateUserAddressHandler(IUserAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<UserAddressDto> Handle(CreateUserAddressCommand request, CancellationToken cancellationToken)
    {
        var city = string.IsNullOrWhiteSpace(request.City) ? "Hồ Chí Minh" : request.City.Trim();

        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            RecipientName = request.RecipientName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            StreetAddress = request.StreetAddress.Trim(),
            Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim(),
            District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim(),
            City = city,
            IsDefault = request.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _addressRepository.AddAsync(address, cancellationToken);
        return GetMyAddressesHandler.MapToDto(created);
    }
}
