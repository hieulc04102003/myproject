using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class OptionGroup
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string SelectionType { get; set; } = null!;

    public bool? IsRequired { get; set; }

    public int? MinSelection { get; set; }

    public int? MaxSelection { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Option> Options { get; set; } = new List<Option>();

    public virtual ICollection<ProductOptionGroup> ProductOptionGroups { get; set; } = new List<ProductOptionGroup>();
}
