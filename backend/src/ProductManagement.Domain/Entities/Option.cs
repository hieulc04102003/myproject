using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class Option
{
    public Guid Id { get; set; }

    public Guid OptionGroupId { get; set; }

    public string Name { get; set; } = null!;

    public decimal PriceModifier { get; set; }

    public bool? IsAvailable { get; set; }

    public int? DisplayOrder { get; set; }

    public virtual OptionGroup OptionGroup { get; set; } = null!;

    public virtual ICollection<OrderItemOption> OrderItemOptions { get; set; } = new List<OrderItemOption>();

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
