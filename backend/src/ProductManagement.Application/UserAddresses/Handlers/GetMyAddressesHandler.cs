using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.UserAddresses.Queries;

namespace ProductManagement.Application.UserAddresses.Handlers;

public class GetMyAddressesHandler : IRequestHandler<GetMyAddressesQuery, IReadOnlyList<UserAddressDto>>
{
    private readonly IUserAddressRepository _addressRepository;

    public GetMyAddressesHandler(IUserAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<IReadOnlyList<UserAddressDto>> Handle(GetMyAddressesQuery request, CancellationToken cancellationToken)
    {
        var addresses = await _addressRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return addresses.Select(MapToDto).ToList().AsReadOnly();
    }

    internal static UserAddressDto MapToDto(Domain.Entities.UserAddress address)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(address.StreetAddress)) parts.Add(address.StreetAddress);
        if (!string.IsNullOrWhiteSpace(address.Ward)) parts.Add(address.Ward);
        if (!string.IsNullOrWhiteSpace(address.District)) parts.Add(address.District);
        if (!string.IsNullOrWhiteSpace(address.City)) parts.Add(address.City);

        return new UserAddressDto(
            address.Id,
            address.UserId,
            address.RecipientName,
            address.PhoneNumber,
            address.StreetAddress,
            address.Ward,
            address.District,
            address.City,
            address.IsDefault ?? false,
            string.Join(", ", parts),
            address.CreatedAt
        );
    }
}
