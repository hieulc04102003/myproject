namespace ProductManagement.Domain.Errors;

/// <summary>
/// Domain Error: Đại diện cho các lỗi nghiệp vụ trong domain layer
/// Sử dụng cho Result Pattern
/// </summary>
public record DomainError(string Code, string Message)
{
    public static readonly DomainError None = new(string.Empty, string.Empty);
    public static readonly DomainError NullValue = new("Error.NullValue", "The specified value is null");
}

/// <summary>
/// Product-specific errors
/// </summary>
public static class ProductErrors
{
    public static DomainError NotFound(Guid id) =>
        new("Product.NotFound", $"Product with ID '{id}' was not found");

    public static DomainError InvalidName =>
        new("Product.InvalidName", "Product name is required and cannot be empty");

    public static DomainError InvalidPrice =>
        new("Product.InvalidPrice", "Product price must be greater than or equal to zero");

    public static DomainError InvalidStock =>
        new("Product.InvalidStock", "Product stock must be greater than or equal to zero");

    public static DomainError InsufficientStock(int available, int requested) =>
        new("Product.InsufficientStock", $"Insufficient stock. Available: {available}, Requested: {requested}");
}
