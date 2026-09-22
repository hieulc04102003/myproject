using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Users.Handlers;

public class GetUsersHandler : IRequestHandler<ProductManagement.Application.Users.Queries.GetUsersQuery, ProductManagement.Application.Common.Dto.PagedResult<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ProductManagement.Application.Common.Dto.PagedResult<UserDto>> Handle(ProductManagement.Application.Users.Queries.GetUsersQuery request, CancellationToken cancellationToken)
    {
        var (items, total) = await _userRepository.GetPagedAsync(request.Page, request.PageSize, request.Role, request.Search, request.IsActive, cancellationToken);

        var dtos = items.Select(u => new UserDto(u.Id, u.FullName, u.Email, u.PhoneNumber, u.Role, u.IsActive, u.CreatedAt, u.UpdatedAt, u.IsPhoneVerified)).ToList();

        return new ProductManagement.Application.Common.Dto.PagedResult<UserDto>(dtos, total, request.Page, request.PageSize);
    }
}
