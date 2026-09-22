using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class ProductReview
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public Guid UserId { get; set; }

    public Guid? OrderId { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
