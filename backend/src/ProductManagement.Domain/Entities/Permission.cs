using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

/// <summary>
/// Quyền chi tiết (Permission): ví dụ "products.create", "orders.update-status".
/// </summary>
public class Permission
{
    public Guid Id { get; set; }

    /// <summary>Mã quyền, unique. Quy ước: "{resource}.{action}" vd "products.create".</summary>
    public string Code { get; set; } = null!;

    /// <summary>Tên hiển thị tiếng Việt thân thiện, vd "Xem danh sách sản phẩm".</summary>
    public string? Name { get; set; }

    /// <summary>HTTP Method: GET, POST, PUT, DELETE, PATCH, *</summary>
    public string? HttpMethod { get; set; }

    /// <summary>Đường dẫn API route pattern, vd "/api/products", "/api/products/{id}".</summary>
    public string? Url { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
