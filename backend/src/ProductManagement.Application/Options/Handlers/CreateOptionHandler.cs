using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Options.Handlers;

public class CreateOptionHandler : IRequestHandler<CreateOptionCommand, OptionDto>
{
    private readonly IOptionRepository _optionRepository;
    private readonly IOptionGroupRepository _optionGroupRepository;

    public CreateOptionHandler(IOptionRepository optionRepository, IOptionGroupRepository optionGroupRepository)
    {
        _optionRepository = optionRepository;
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<OptionDto> Handle(CreateOptionCommand request, CancellationToken cancellationToken)
    {
        var group = await _optionGroupRepository.GetByIdAsync(request.OptionGroupId, cancellationToken);
        if (group == null)
        {
            throw new ArgumentException($"Option group with id {request.OptionGroupId} not found");
        }

        var option = new Option
        {
            Id = Guid.NewGuid(),
            OptionGroupId = request.OptionGroupId,
            Name = request.Name,
            PriceModifier = request.PriceModifier,
            IsAvailable = request.IsAvailable ?? true,
            DisplayOrder = request.DisplayOrder ?? 0
        };

        await _optionRepository.AddAsync(option, cancellationToken);

        return new OptionDto(option.Id, option.Name, option.PriceModifier, option.IsAvailable);
    }
}
