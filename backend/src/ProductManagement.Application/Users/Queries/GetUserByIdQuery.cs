using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Users.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto?>;
