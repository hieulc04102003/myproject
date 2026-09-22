using ProductManagement.Domain.Errors;

namespace ProductManagement.Application.Common;

/// <summary>
/// Result Pattern: Thay thế exception cho flow control
/// Giúp code rõ ràng hơn và dễ test hơn
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public DomainError Error { get; }

    protected Result(bool isSuccess, DomainError error)
    {
        if (isSuccess && error != DomainError.None)
            throw new InvalidOperationException("Success result cannot have an error");

        if (!isSuccess && error == DomainError.None)
            throw new InvalidOperationException("Failure result must have an error");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, DomainError.None);
    public static Result Failure(DomainError error) => new(false, error);

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, DomainError.None);
    public static Result<TValue> Failure<TValue>(DomainError error) => new(default!, false, error);
}

/// <summary>
/// Generic Result với giá trị trả về
/// </summary>
public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, DomainError error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access value of a failure result");
}
