using MediatR;
using ProductManagement.Application.Common.Dto;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;

namespace ProductManagement.Application.Options.Handlers;

public class UpdateOptionHandler : IRequestHandler<UpdateOptionCommand, OptionDto?>
{
    private readonly IOptionRepository _optionRepository;

    public UpdateOptionHandler(IOptionRepository optionRepository)
    {
        _optionRepository = optionRepository;
    }

    public async Task<OptionDto?> Handle(UpdateOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _optionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (option == null) return null;

        option.Name = request.Name;
        option.PriceModifier = request.PriceModifier;
        if (request.IsAvailable.HasValue)
        {
            option.IsAvailable = request.IsAvailable.Value;
        }
        if (request.DisplayOrder.HasValue)
        {
            option.DisplayOrder = request.DisplayOrder.Value;
        }

        await _optionRepository.UpdateAsync(option, cancellationToken);

        return new OptionDto(option.Id, option.Name, option.PriceModifier, option.IsAvailable);
    }
}
