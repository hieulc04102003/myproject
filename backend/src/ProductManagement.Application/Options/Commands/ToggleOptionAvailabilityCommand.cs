using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Options.Commands;

public record ToggleOptionAvailabilityCommand(Guid Id) : IRequest<OptionDto?>;
