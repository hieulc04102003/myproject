using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IOptionGroupRepository
{
    Task<List<OptionGroup>> GetAllWithOptionsAsync(CancellationToken cancellationToken = default);
    Task<OptionGroup?> GetByIdWithOptionsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OptionGroup?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default);
    Task UpdateAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default);
    Task DeleteAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default);
}
