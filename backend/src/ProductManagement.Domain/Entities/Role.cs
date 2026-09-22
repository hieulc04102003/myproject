using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

/// <summary>
/// Vai trò trong hệ thống (RBAC): CUSTOMER, STAFF, ADMIN...
/// </summary>
public class Role
{
    public Guid Id { get; set; }

    /// <summary>Tên vai trò, ví dụ "ADMIN" (unique).</summary>
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
