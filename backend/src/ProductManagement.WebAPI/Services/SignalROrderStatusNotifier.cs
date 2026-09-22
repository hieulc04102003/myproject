using Microsoft.AspNetCore.SignalR;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.WebAPI.Hubs;

namespace ProductManagement.WebAPI.Services;

/// <summary>
/// Phát sự kiện thay đổi trạng thái đơn hàng qua SignalR.
/// </summary>
public class SignalROrderStatusNotifier : IOrderStatusNotifier
{
    private readonly IHubContext<OrderStatusHub> _hubContext;
    private readonly ILogger<SignalROrderStatusNotifier> _logger;

    public SignalROrderStatusNotifier(
        IHubContext<OrderStatusHub> hubContext,
        ILogger<SignalROrderStatusNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyOrderStatusChangedAsync(
        Guid? userId,
        string orderCode,
        string previousStatus,
        string newStatus,
        CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            orderCode,
            previousStatus,
            newStatus,
            updatedAt = DateTime.UtcNow
        };

        try
        {
            if (userId.HasValue)
            {
                await _hubContext.Clients
                    .Group($"user-{userId.Value}")
                    .SendAsync("OrderStatusChanged", payload, cancellationToken);
            }

            await _hubContext.Clients
                .Group("staff")
                .SendAsync("OrderStatusChanged", payload, cancellationToken);

            await _hubContext.Clients
                .Group($"order-{orderCode.ToUpperInvariant()}")
                .SendAsync("OrderStatusChanged", payload, cancellationToken);
        }
        catch (Exception ex)
        {
            // Không làm hỏng luồng cập nhật trạng thái nếu broadcast lỗi
            _logger.LogError(ex, "Lỗi phát sự kiện SignalR OrderStatusChanged cho đơn {OrderCode}", orderCode);
        }
    }
}
