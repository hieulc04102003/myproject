using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;

namespace ProductManagement.Application.Options.Handlers;

public class DeleteOptionHandler : IRequestHandler<DeleteOptionCommand, bool>
{
    private readonly IOptionRepository _optionRepository;

    public DeleteOptionHandler(IOptionRepository optionRepository)
    {
        _optionRepository = optionRepository;
    }

    public async Task<bool> Handle(DeleteOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _optionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (option == null) return false;

        await _optionRepository.DeleteAsync(option, cancellationToken);
        return true;
    }
}
