using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Queries;

namespace ProductManagement.Application.Options.Handlers;

public class GetOptionGroupByIdHandler : IRequestHandler<GetOptionGroupByIdQuery, OptionGroupDto?>
{
    private readonly IOptionGroupRepository _optionGroupRepository;

    public GetOptionGroupByIdHandler(IOptionGroupRepository optionGroupRepository)
    {
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<OptionGroupDto?> Handle(GetOptionGroupByIdQuery request, CancellationToken cancellationToken)
    {
        var group = await _optionGroupRepository.GetByIdWithOptionsAsync(request.Id, cancellationToken);
        if (group == null) return null;

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
