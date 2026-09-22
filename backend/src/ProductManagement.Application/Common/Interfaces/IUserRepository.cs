using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    /// <summary>
    /// Get paged users for admin listing with optional role filter.
    /// </summary>
    Task<(List<User> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? role = null, string? search = null, bool? isActive = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// RBAC: gán một vai trò (theo tên, vd "ADMIN") cho user, thay thế các role cũ nếu replace=true.
    /// </summary>
    Task AssignRoleAsync(Guid userId, string roleName, bool replace = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// RBAC: nạp các role của user vào navigation UserRoles (bao gồm Role entity).
    /// </summary>
    Task LoadRolesAsync(User user, CancellationToken cancellationToken = default);
}
