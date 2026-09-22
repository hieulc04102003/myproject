using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class ProductOptionGroup
{
    public Guid ProductId { get; set; }

    public Guid OptionGroupId { get; set; }

    public int? DisplayOrder { get; set; }

    public virtual OptionGroup OptionGroup { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
