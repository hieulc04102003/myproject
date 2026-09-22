using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Queries;

public record GetUsersQuery(
    int Page = 1,
    int PageSize = 20,
    string? Role = null,
    string? Search = null,
    bool? IsActive = null
) : IRequest<ProductManagement.Application.Common.Dto.PagedResult<UserDto>>;
