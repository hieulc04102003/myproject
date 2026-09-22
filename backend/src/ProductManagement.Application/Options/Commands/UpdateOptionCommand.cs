using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Options.Commands;

public record UpdateOptionCommand(
    Guid Id,
    string Name,
    decimal PriceModifier,
    bool? IsAvailable,
    int? DisplayOrder
) : IRequest<OptionDto?>;
