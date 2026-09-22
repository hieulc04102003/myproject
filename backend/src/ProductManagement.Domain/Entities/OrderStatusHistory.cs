using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class OrderStatusHistory
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public string? PreviousStatus { get; set; }

    public string NewStatus { get; set; } = null!;

    public Guid? ChangedByUserId { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? ChangedByUser { get; set; }

    public virtual Order Order { get; set; } = null!;
}
