using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class CartItem
{
    public Guid Id { get; set; }

    public Guid CartId { get; set; }

    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Cart Cart { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual ICollection<Option> Options { get; set; } = new List<Option>();
}
