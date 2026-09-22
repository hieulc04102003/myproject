using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Products.Handlers;

public class GetOptionGroupsHandler : IRequestHandler<ProductManagement.Application.Products.Queries.GetOptionGroupsQuery, List<OptionGroupDto>>
{
    private readonly IOptionGroupRepository _optionGroupRepository;

    public GetOptionGroupsHandler(IOptionGroupRepository optionGroupRepository)
    {
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<List<OptionGroupDto>> Handle(ProductManagement.Application.Products.Queries.GetOptionGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _optionGroupRepository.GetAllWithOptionsAsync(cancellationToken);
        // map to DTOs
        return groups.Select(g => new OptionGroupDto(
            g.Id,
            g.Name,
            g.SelectionType,
            g.IsRequired,
            g.MinSelection,
            g.MaxSelection,
            g.Options.Select(o => new OptionDto(o.Id, o.Name, o.PriceModifier, o.IsAvailable)).ToList()
        )).ToList();
    }
}
