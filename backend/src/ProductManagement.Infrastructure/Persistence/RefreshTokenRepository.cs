using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly MyProjectContext _context;

    public RefreshTokenRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        _context.RefreshTokens.Add(token);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            var detail = ex.InnerException?.Message ?? ex.Message;
            throw new InvalidOperationException($"Database error when adding refresh token: {detail}", ex);
        }
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == token, cancellationToken);
    }

    public async Task UpdateAsync(RefreshToken token, CancellationToken cancellationToken = default)
    {
        _context.RefreshTokens.Update(token);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
