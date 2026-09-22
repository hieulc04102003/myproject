namespace ProductManagement.Application.Common.Dto;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int? DisplayOrder,
    bool? IsActive,
    DateTime CreatedAt
);
