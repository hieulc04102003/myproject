using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

/// <summary>
/// Triển khai IUserAddressRepository thao tác với cơ sở dữ liệu qua EF Core.
/// </summary>
public class UserAddressRepository : IUserAddressRepository
{
    private readonly MyProjectContext _context;

    public UserAddressRepository(MyProjectContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UserAddress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserAddresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault ?? false)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<UserAddress?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.UserAddresses
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<UserAddress> AddAsync(UserAddress address, CancellationToken cancellationToken = default)
    {
        var existingCount = await _context.UserAddresses
            .CountAsync(a => a.UserId == address.UserId, cancellationToken);

        // Nếu là địa chỉ đầu tiên hoặc được đánh dấu mặc định
        if (existingCount == 0)
        {
            address.IsDefault = true;
        }
        else if (address.IsDefault == true)
        {
            // Bỏ mặc định tất cả địa chỉ cũ của người dùng này
            var otherDefaults = await _context.UserAddresses
                .Where(a => a.UserId == address.UserId && (a.IsDefault == true))
                .ToListAsync(cancellationToken);

            foreach (var item in otherDefaults)
            {
                item.IsDefault = false;
            }
        }

        if (address.Id == Guid.Empty)
        {
            address.Id = Guid.NewGuid();
        }
        address.CreatedAt = DateTime.UtcNow;

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync(cancellationToken);

        return address;
    }

    public async Task UpdateAsync(UserAddress address, CancellationToken cancellationToken = default)
    {
        if (address.IsDefault == true)
        {
            var otherDefaults = await _context.UserAddresses
                .Where(a => a.UserId == address.UserId && a.Id != address.Id && (a.IsDefault == true))
                .ToListAsync(cancellationToken);

            foreach (var item in otherDefaults)
            {
                item.IsDefault = false;
            }
        }

        _context.UserAddresses.Update(address);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(UserAddress address, CancellationToken cancellationToken = default)
    {
        var wasDefault = address.IsDefault == true;
        var userId = address.UserId;

        _context.UserAddresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);

        // Nếu vừa xóa địa chỉ mặc định, tự động gán địa chỉ còn lại gần nhất làm mặc định
        if (wasDefault)
        {
            var nextAddress = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (nextAddress != null)
            {
                nextAddress.IsDefault = true;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }

    public async Task SetDefaultAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default)
    {
        var addresses = await _context.UserAddresses
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);

        foreach (var addr in addresses)
        {
            addr.IsDefault = (addr.Id == addressId);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
