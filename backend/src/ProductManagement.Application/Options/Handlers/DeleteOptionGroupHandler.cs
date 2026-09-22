using MediatR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Options.Commands;

namespace ProductManagement.Application.Options.Handlers;

public class DeleteOptionGroupHandler : IRequestHandler<DeleteOptionGroupCommand, bool>
{
    private readonly IOptionGroupRepository _optionGroupRepository;

    public DeleteOptionGroupHandler(IOptionGroupRepository optionGroupRepository)
    {
        _optionGroupRepository = optionGroupRepository;
    }

    public async Task<bool> Handle(DeleteOptionGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _optionGroupRepository.GetByIdWithOptionsAsync(request.Id, cancellationToken);
        if (group == null) return false;

        await _optionGroupRepository.DeleteAsync(group, cancellationToken);
        return true;
    }
}
