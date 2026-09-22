using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;

namespace ProductManagement.Application.Options.Handlers;

public class UpdateOptionGroupHandler : IRequestHandler<UpdateOptionGroupCommand, OptionGroupDto?>
{
    private readonly IOptionGroupRepository _optionGroupRepository;

    public UpdateOptionGroupHandler(IOptionGroupRepository optionGroupRepository)
    {
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<OptionGroupDto?> Handle(UpdateOptionGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _optionGroupRepository.GetByIdWithOptionsAsync(request.Id, cancellationToken);
        if (group == null) return null;

        group.Name = request.Name;
        if (!string.IsNullOrWhiteSpace(request.SelectionType))
        {
            group.SelectionType = request.SelectionType.ToUpperInvariant();
        }
        if (request.IsRequired.HasValue)
        {
            group.IsRequired = request.IsRequired.Value;
        }
        if (request.MinSelection.HasValue)
        {
            group.MinSelection = request.MinSelection.Value;
        }
        if (request.MaxSelection.HasValue)
        {
            group.MaxSelection = request.MaxSelection.Value;
        }

        await _optionGroupRepository.UpdateAsync(group, cancellationToken);

        var optionDtos = group.Options?.Select(o => new OptionDto(o.Id, o.Name, o.PriceModifier, o.IsAvailable)).ToList() ?? new List<OptionDto>();

        return new OptionGroupDto(
            group.Id,
            group.Name,
            group.SelectionType,
            group.IsRequired,
            group.MinSelection,
            group.MaxSelection,
            optionDtos
        );
    }
}
