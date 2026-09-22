using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class OrderItemOption
{
    public Guid Id { get; set; }

    public Guid OrderItemId { get; set; }

    public Guid? OptionId { get; set; }

    public string OptionName { get; set; } = null!;

    public decimal OptionPrice { get; set; }

    public virtual Option? Option { get; set; }

    public virtual OrderItem OrderItem { get; set; } = null!;
}
