using System;

namespace ProductManagement.Application.Common.Dto;

/// <summary>
/// Data Transfer Object representing a User's Delivery Address.
/// </summary>
public record UserAddressDto(
    Guid Id,
    Guid UserId,
    string RecipientName,
    string PhoneNumber,
    string StreetAddress,
    string? Ward,
    string? District,
    string City,
    bool IsDefault,
    string FullAddress,
    DateTime CreatedAt
);

/// <summary>
/// Request to create a new delivery address.
/// </summary>
public record CreateUserAddressRequest(
    string RecipientName,
    string PhoneNumber,
    string StreetAddress,
    string? Ward = null,
    string? District = null,
    string? City = null,
    bool IsDefault = false
);

/// <summary>
/// Request to update an existing delivery address.
/// </summary>
public record UpdateUserAddressRequest(
    string RecipientName,
    string PhoneNumber,
    string StreetAddress,
    string? Ward = null,
    string? District = null,
    string? City = null,
    bool IsDefault = false
);
