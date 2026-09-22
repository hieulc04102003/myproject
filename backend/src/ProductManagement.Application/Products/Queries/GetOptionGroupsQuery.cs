using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Queries;

public record GetOptionGroupsQuery() : IRequest<List<OptionGroupDto>>;
