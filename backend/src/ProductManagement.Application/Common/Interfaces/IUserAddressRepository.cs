using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

/// <summary>
/// Repository interface for managing UserAddress entities.
/// </summary>
public interface IUserAddressRepository
{
    /// <summary>
    /// Lấy danh sách địa chỉ của người dùng theo UserId, ưu tiên địa chỉ mặc định lên đầu.
    /// </summary>
    Task<IReadOnlyList<UserAddress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy địa chỉ theo Id.
    /// </summary>
    Task<UserAddress?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm một địa chỉ mới.
    /// </summary>
    Task<UserAddress> AddAsync(UserAddress address, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật thông tin địa chỉ.
    /// </summary>
    Task UpdateAsync(UserAddress address, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xóa địa chỉ.
    /// </summary>
    Task DeleteAsync(UserAddress address, CancellationToken cancellationToken = default);

    /// <summary>
    /// Đặt địa chỉ làm mặc định cho người dùng (và bỏ mặc định của các địa chỉ khác).
    /// </summary>
    Task SetDefaultAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default);
}
