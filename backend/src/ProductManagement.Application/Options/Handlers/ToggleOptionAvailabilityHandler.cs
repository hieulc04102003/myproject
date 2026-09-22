using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;

namespace ProductManagement.Application.Options.Handlers;

public class ToggleOptionAvailabilityHandler : IRequestHandler<ToggleOptionAvailabilityCommand, OptionDto?>
{
    private readonly IOptionRepository _optionRepository;

    public ToggleOptionAvailabilityHandler(IOptionRepository optionRepository)
    {
        _optionRepository = optionRepository;
    }

    public async Task<OptionDto?> Handle(ToggleOptionAvailabilityCommand request, CancellationToken cancellationToken)
    {
        var option = await _optionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (option == null) return null;

        option.IsAvailable = !(option.IsAvailable ?? true);
        await _optionRepository.UpdateAsync(option, cancellationToken);

        return new OptionDto(option.Id, option.Name, option.PriceModifier, option.IsAvailable);
    }
}
