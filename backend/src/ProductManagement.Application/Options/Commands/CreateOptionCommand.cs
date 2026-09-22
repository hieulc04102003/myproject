using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Options.Commands;

public record CreateOptionCommand(
    Guid OptionGroupId,
    string Name,
    decimal PriceModifier,
    bool? IsAvailable,
    int? DisplayOrder
) : IRequest<OptionDto>;
