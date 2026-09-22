namespace ProductManagement.Application.Common.Interfaces;

/// <summary>
/// Unit of Work Pattern: Quản lý transaction cho multiple repository operations
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute the provided async function within a database transaction. Implementations
    /// should begin a transaction, execute the function, commit on success and rollback on error.
    /// Returns the function result.
    /// </summary>
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default);
}
