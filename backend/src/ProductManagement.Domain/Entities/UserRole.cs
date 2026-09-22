using System;

namespace ProductManagement.Domain.Entities;

/// <summary>
/// Bảng nối many-to-many: User <=> Role. Một user có thể có nhiều vai trò.
/// </summary>
public class UserRole
{
    public Guid UserId { get; set; }

    public Guid RoleId { get; set; }

    public DateTime AssignedAt { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;
}
