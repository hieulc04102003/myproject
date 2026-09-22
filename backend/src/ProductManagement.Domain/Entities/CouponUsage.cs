using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class CouponUsage
{
    public Guid Id { get; set; }

    public Guid CouponId { get; set; }

    public Guid UserId { get; set; }

    public DateTime UsedAt { get; set; }

    public virtual Coupon Coupon { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
