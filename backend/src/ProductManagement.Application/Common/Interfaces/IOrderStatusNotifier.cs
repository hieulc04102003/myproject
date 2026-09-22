namespace ProductManagement.Application.Common.Interfaces;

/// <summary>
/// Thông báo sự kiện cập nhật trạng thái đơn hàng theo thời gian thực (SignalR).
/// </summary>
public interface IOrderStatusNotifier
{
    /// <summary>
    /// Phát sự kiện trạng thái đơn hàng thay đổi tới khách hàng (theo userId)
    /// và tới nhân viên (group staff).
    /// </summary>
    Task NotifyOrderStatusChangedAsync(
        Guid? userId,
        string orderCode,
        string previousStatus,
        string newStatus,
        CancellationToken cancellationToken = default);
}
