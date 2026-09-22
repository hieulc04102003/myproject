using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Options.Queries;

public record GetOptionGroupByIdQuery(Guid Id) : IRequest<OptionGroupDto?>;
