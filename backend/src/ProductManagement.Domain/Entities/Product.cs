using System;
using System.Collections.Generic;

namespace ProductManagement.Domain.Entities;

public partial class Product
{
    public Guid Id { get; set; }

    public Guid CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public decimal BasePrice { get; set; }

    public string? ImageUrl { get; set; }

    public bool? IsAvailable { get; set; }

    public bool? IsFeatured { get; set; }

    public int StockQuantity { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<ProductOptionGroup> ProductOptionGroups { get; set; } = new List<ProductOptionGroup>();

    public virtual ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
}
