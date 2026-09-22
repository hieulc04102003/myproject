using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

/// <summary>
/// Repository xử lý các thao tác liên quan tới entity User bằng EF Core.
/// Triển khai giao diện IUserRepository để tách biệt tầng Infrastructure với Application.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly MyProjectContext _context;

    /// <summary>
    /// Khởi tạo UserRepository với DbContext được inject.
    /// </summary>
    /// <param name="context">EF Core DbContext (MyProjectContext)</param>
    public UserRepository(MyProjectContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Thêm một User mới vào database và gọi SaveChanges.
    /// Bắt DbUpdateException để bọc lại bằng InvalidOperationException với chi tiết inner exception
    /// nhằm giúp debug dễ hơn (ví dụ vi phạm ràng buộc unique).
    /// </summary>
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Add(user);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            // Hiện thông tin lỗi DB (ví dụ duplicate key) để tầng Application có thể hiển thị thông báo rõ ràng
            var detail = ex.InnerException?.Message ?? ex.Message;
            throw new InvalidOperationException($"Lỗi khi lưu User vào database: {detail}", ex);
        }
    }

    /// <summary>
    /// Lấy User theo email. Trả về null nếu không tìm thấy.
    /// </summary>
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    /// <summary>
    /// Lấy User theo số điện thoại (chuẩn hóa các định dạng).
    /// </summary>
    public async Task<User?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber)) return null;
        var clean = new string(phoneNumber.Where(char.IsDigit).ToArray());
        if (clean.StartsWith("84") && clean.Length >= 11)
        {
            clean = "0" + clean.Substring(2);
        }
        return await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == clean || u.PhoneNumber == phoneNumber, cancellationToken);
    }

    /// <summary>
    /// Lấy User theo Id (primary key).
    /// </summary>
    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FindAsync(new object[] { id }, cancellationToken);
    }

    /// <summary>
    /// Cập nhật thông tin User và lưu thay đổi.
    /// </summary>
    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await GetByIdAsync(id, cancellationToken);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<(List<User> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? role = null, string? search = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                u.PhoneNumber.Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);

        var skip = Math.Max(0, (page - 1)) * pageSize;
        var items = await query.OrderBy(u => u.FullName).Skip(skip).Take(pageSize).ToListAsync(cancellationToken);

        // Nạp roles cho từng user để dto.Role hoạt động
        await LoadRolesForManyAsync(items, cancellationToken);

        return (items, total);
    }

    /// <inheritdoc />
    public async Task AssignRoleAsync(Guid userId, string roleName, bool replace = true, CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken)
            ?? throw new InvalidOperationException($"Vai trò '{roleName}' không tồn tại trong hệ thống.");

        if (replace)
        {
            var existing = await _context.UserRoles.Where(ur => ur.UserId == userId).ToListAsync(cancellationToken);
            _context.UserRoles.RemoveRange(existing);
        }

        var already = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.Id, cancellationToken);
        if (!already)
        {
            _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id, AssignedAt = DateTime.UtcNow });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task LoadRolesAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user.UserRoles is List<UserRole> list && list.Count > 0 && list.All(ur => ur.Role != null))
            return;

        await _context.Entry(user)
            .Collection(u => u.UserRoles)
            .Query()
            .Include(ur => ur.Role)
            .LoadAsync(cancellationToken);
    }

    private async Task LoadRolesForManyAsync(List<User> users, CancellationToken cancellationToken = default)
    {
        if (users.Count == 0) return;

        var ids = users.Select(u => u.Id).ToList();
        var rolesByUser = await _context.UserRoles
            .Where(ur => ids.Contains(ur.UserId))
            .Include(ur => ur.Role)
            .ToListAsync(cancellationToken);

        foreach (var user in users)
        {
            user.UserRoles = rolesByUser.Where(ur => ur.UserId == user.Id).ToList();
        }
    }
}
