using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class OptionRepository : IOptionRepository
{
    private readonly MyProjectContext _context;

    public OptionRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task<Option?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Options.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Option option, CancellationToken cancellationToken = default)
    {
        _context.Options.Add(option);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Option option, CancellationToken cancellationToken = default)
    {
        _context.Options.Update(option);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Option option, CancellationToken cancellationToken = default)
    {
        _context.Options.Remove(option);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
