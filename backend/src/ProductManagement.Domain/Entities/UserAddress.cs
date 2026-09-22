using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class UserAddress
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string RecipientName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string StreetAddress { get; set; } = null!;

    public string? Ward { get; set; }

    public string? District { get; set; }

    public string City { get; set; } = null!;

    public bool? IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
