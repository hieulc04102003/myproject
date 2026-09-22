using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class OrderItem
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public Guid? ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public decimal ItemTotalPrice { get; set; }

    public string? ItemNote { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual ICollection<OrderItemOption> OrderItemOptions { get; set; } = new List<OrderItemOption>();

    public virtual Product? Product { get; set; }
}
