using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class OptionGroupRepository : IOptionGroupRepository
{
    private readonly MyProjectContext _context;

    public OptionGroupRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task<List<OptionGroup>> GetAllWithOptionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.OptionGroups
            .Include(og => og.Options)
            .ToListAsync(cancellationToken);
    }

    public async Task<OptionGroup?> GetByIdWithOptionsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OptionGroups
            .Include(og => og.Options)
            .FirstOrDefaultAsync(og => og.Id == id, cancellationToken);
    }

    public async Task<OptionGroup?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OptionGroups.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default)
    {
        _context.OptionGroups.Add(optionGroup);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default)
    {
        _context.OptionGroups.Update(optionGroup);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(OptionGroup optionGroup, CancellationToken cancellationToken = default)
    {
        _context.OptionGroups.Remove(optionGroup);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
