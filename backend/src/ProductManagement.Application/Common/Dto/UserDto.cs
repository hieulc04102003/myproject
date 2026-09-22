namespace ProductManagement.Application.Common.Dto;

public record UserDto(
    Guid Id,
    string FullName,
    string? Email,
    string PhoneNumber,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsPhoneVerified = false
);
