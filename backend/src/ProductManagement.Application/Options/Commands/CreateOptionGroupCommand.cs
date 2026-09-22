using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Options.Commands;

public record CreateOptionGroupCommand(
    string Name,
    string SelectionType,
    bool? IsRequired,
    int? MinSelection,
    int? MaxSelection
) : IRequest<OptionGroupDto>;
