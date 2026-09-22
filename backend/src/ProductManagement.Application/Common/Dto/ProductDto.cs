namespace ProductManagement.Application.Common.Dto;

public record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    Guid CategoryId,
    string? CategoryName,
    decimal BasePrice,
    string? ImageUrl,
    bool? IsAvailable,
    bool? IsFeatured,
    int StockQuantity = 0,
    List<OptionGroupDto>? OptionGroups = null
);
