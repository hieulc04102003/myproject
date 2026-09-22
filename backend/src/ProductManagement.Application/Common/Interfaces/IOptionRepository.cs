using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IOptionRepository
{
    Task<Option?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Option option, CancellationToken cancellationToken = default);
    Task UpdateAsync(Option option, CancellationToken cancellationToken = default);
    Task DeleteAsync(Option option, CancellationToken cancellationToken = default);
}
