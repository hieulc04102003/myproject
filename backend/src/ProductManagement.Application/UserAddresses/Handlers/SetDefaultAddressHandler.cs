using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.UserAddresses.Commands;

namespace ProductManagement.Application.UserAddresses.Handlers;

public class SetDefaultAddressHandler : IRequestHandler<SetDefaultAddressCommand, bool>
{
    private readonly IUserAddressRepository _addressRepository;

    public SetDefaultAddressHandler(IUserAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<bool> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.AddressId, cancellationToken);

        // Từ chối nếu không tìm thấy hoặc địa chỉ không thuộc người dùng hiện tại
        if (address == null || address.UserId != request.UserId)
            return false;

        await _addressRepository.SetDefaultAsync(request.UserId, request.AddressId, cancellationToken);
        return true;
    }
}
