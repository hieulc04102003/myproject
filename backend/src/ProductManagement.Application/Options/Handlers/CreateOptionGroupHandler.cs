using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Options.Handlers;

public class CreateOptionGroupHandler : IRequestHandler<CreateOptionGroupCommand, OptionGroupDto>
{
    private readonly IOptionGroupRepository _optionGroupRepository;

    public CreateOptionGroupHandler(IOptionGroupRepository optionGroupRepository)
    {
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<OptionGroupDto> Handle(CreateOptionGroupCommand request, CancellationToken cancellationToken)
    {
        var group = new OptionGroup
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            SelectionType = string.IsNullOrWhiteSpace(request.SelectionType) ? "MULTIPLE" : request.SelectionType.ToUpperInvariant(),
            IsRequired = request.IsRequired ?? false,
            MinSelection = request.MinSelection ?? 0,
            MaxSelection = request.MaxSelection ?? 0,
            CreatedAt = DateTime.UtcNow,
            Options = new List<Option>()
        };

        await _optionGroupRepository.AddAsync(group, cancellationToken);

        return new OptionGroupDto(
            group.Id,
            group.Name,
            group.SelectionType,
            group.IsRequired,
            group.MinSelection,
            group.MaxSelection,
            new List<OptionDto>()
        );
    }
}
