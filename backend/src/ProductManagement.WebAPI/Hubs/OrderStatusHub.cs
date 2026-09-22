using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ProductManagement.WebAPI.Hubs;

/// <summary>
/// SignalR hub cho cập nhật trạng thái đơn hàng theo thời gian thực.
/// - Customer join group theo UserId để nhận cập nhật đơn của chính mình.
/// - Staff/Admin join group "staff" để nhận mọi cập nhật.
/// </summary>
[Authorize]
public class OrderStatusHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        var role = Context.User?.FindFirst("role")?.Value
                ?? Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(role, "STAFF", StringComparison.OrdinalIgnoreCase))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "staff");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Cho phép client chủ động join vào group của một đơn hàng cụ thể (theo mã đơn).
    /// </summary>
    public async Task WatchOrder(string orderCode)
    {
        if (!string.IsNullOrWhiteSpace(orderCode))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderCode.ToUpperInvariant()}");
        }
    }

    public async Task UnwatchOrder(string orderCode)
    {
        if (!string.IsNullOrWhiteSpace(orderCode))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderCode.ToUpperInvariant()}");
        }
    }
}
