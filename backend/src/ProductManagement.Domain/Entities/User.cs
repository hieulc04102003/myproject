using System;
using System.Collections.Generic;
using System.Linq;

namespace ProductManagement.Domain.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? Email { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? AvatarUrl { get; set; }

    // RBAC: role chính của user — không map xuống DB, lấy từ UserRoles (bảng user_roles)
    public string Role => UserRoles?.FirstOrDefault()?.Role?.Name ?? "CUSTOMER";

    public bool IsActive { get; set; }

    public bool IsPhoneVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Cart? Cart { get; set; }

    public virtual ICollection<CouponUsage> CouponUsages { get; set; } = new List<CouponUsage>();

    public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<UserAddress> UserAddresses { get; set; } = new List<UserAddress>();
}
