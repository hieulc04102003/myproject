using System;

namespace ProductManagement.Domain.Entities;

/// <summary>
/// Bảng nối many-to-many: Role <=> Permission.
/// </summary>
public class RolePermission
{
    public Guid RoleId { get; set; }

    public Guid PermissionId { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual Permission Permission { get; set; } = null!;
}
