using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.WebAPI.Middlewares;

/// <summary>
/// =========================================================================================
/// MIDDLEWARE PHÂN QUYỀN API ĐỘNG DỰA TRÊN HTTP METHOD VÀ URL ROUTE PATTERN TỪ DATABASE
/// =========================================================================================
/// Cơ chế hoạt động:
/// 1. Bắt tất cả các HTTP Request gửi đến API sau khi đã qua bước xác thực JWT Authentication.
/// 2. Sử dụng Endpoint Routing của ASP.NET Core để trích xuất Route Template gốc (Raw Route Pattern)
///    thay vì URL chứa tham số động (Ví dụ: nhận diện chính xác "/api/products/{id}" thay vì chuỗi GUID).
/// 3. Đối chiếu cặp (HTTP Method, Route Pattern) với cấu hình quyền hạn trong bảng permissions của DB.
/// 4. Nếu endpoint đã cấu hình kiểm soát và User không có quyền tương ứng trong các Role của họ,
///    ngay lập tức chặn đứng request và trả về HTTP 403 Forbidden.
/// =========================================================================================
/// </summary>
public class DynamicPermissionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<DynamicPermissionMiddleware> _logger;

    public DynamicPermissionMiddleware(RequestDelegate next, ILogger<DynamicPermissionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IPermissionService permissionService)
    {
        // ---------------------------------------------------------------------------------
        // BƯỚC 1: Lấy Endpoint của Request hiện tại từ ASP.NET Core Routing Pipeline
        // ---------------------------------------------------------------------------------
        var endpoint = context.GetEndpoint();
        if (endpoint == null)
        {
            // Request không trỏ đến Controller/Endpoint nào (vd static file, swagger html...) -> Cho qua
            await _next(context);
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 2: Kiểm tra cờ [AllowAnonymous]
        // Các API công khai (Đăng nhập, Đăng ký, Quên mật khẩu...) luôn được phép truy cập
        // ---------------------------------------------------------------------------------
        if (endpoint.Metadata.GetMetadata<IAllowAnonymous>() != null)
        {
            await _next(context);
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 3: Trích xuất HTTP Method và Route Pattern chuẩn hóa
        // Dùng RouteEndpoint.RoutePattern.RawText để giữ nguyên format "{id}", "{orderId}"
        // ---------------------------------------------------------------------------------
        var routeEndpoint = endpoint as RouteEndpoint;
        var rawPattern = routeEndpoint?.RoutePattern?.RawText;
        if (string.IsNullOrWhiteSpace(rawPattern))
        {
            await _next(context);
            return;
        }

        // Chuẩn hóa route thành định dạng chữ thường bắt đầu bằng "/" (Ví dụ: "/api/products/{id}")
        var normalizedRoute = "/" + rawPattern.Trim().TrimStart('/').ToLowerInvariant();
        var httpMethod = context.Request.Method.Trim().ToUpperInvariant();

        // ---------------------------------------------------------------------------------
        // BƯỚC 4: Kiểm tra xem Endpoint này có yêu cầu phân quyền không
        // Chỉ các Endpoint có thuộc tính [Authorize] mới yêu cầu đăng nhập và kiểm tra phân quyền.
        // Các API công khai (như Xem trang chủ, Xem thực đơn, Danh mục món ăn, Đăng nhập, Đăng ký...)
        // KHÔNG có [Authorize] nên khách vãng lai (chưa đăng nhập) được tự do truy cập 100%.
        // ---------------------------------------------------------------------------------
        var hasAuthorizeAttribute = endpoint.Metadata.GetOrderedMetadata<IAuthorizeData>().Any();
        if (!hasAuthorizeAttribute)
        {
            await _next(context);
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 5: Kiểm tra xác thực (Authentication)
        // Vì Endpoint cần bảo vệ nên bắt buộc Caller phải gửi Access Token JWT hợp lệ
        // ---------------------------------------------------------------------------------
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            _logger.LogWarning("Truy cập chưa xác thực vào endpoint được bảo vệ: {Method} {Route}", httpMethod, normalizedRoute);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                status = 401,
                error = "Unauthorized",
                message = "Yêu cầu đăng nhập hoặc cung cấp Bearer Token hợp lệ để truy cập API này."
            });
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 6: Trích xuất User ID từ Claims trong JWT Token
        // Ở dự án này, Id người dùng được lưu trong Claim 'sub' (hoặc ClaimTypes.NameIdentifier)
        // ---------------------------------------------------------------------------------
        var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? context.User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            _logger.LogWarning("Token không chứa UserId (sub/NameIdentifier) hợp lệ.");
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                status = 403,
                error = "Forbidden",
                message = "Không thể xác định danh tính tài khoản từ Token."
            });
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 7: Kiểm tra phân quyền thực tế (Role -> RolePermission -> Permission)
        // Gọi qua PermissionService: Kiểm tra quyền User đối với cặp (HttpMethod, Url)
        // - Admin luôn được bypass (trả về true).
        // - Các Role khác sẽ được đối chiếu với DB (có bộ nhớ đệm IMemoryCache tối ưu).
        // ---------------------------------------------------------------------------------
        var hasPermission = await permissionService.HasPermissionAsync(userId, httpMethod, normalizedRoute, context.RequestAborted);

        // Nếu endpoint này chưa cấu hình trong DB nhưng có [Authorize] trong code,
        // cho phép người dùng đã đăng nhập đi tiếp (fallback an toàn cho các API chưa kịp cấu hình quyền)
        if (!hasPermission)
        {
            var isConfiguredInDb = await permissionService.IsEndpointConfiguredAsync(httpMethod, normalizedRoute, context.RequestAborted);
            if (!isConfiguredInDb)
            {
                hasPermission = true;
            }
        }

        if (!hasPermission)
        {
            _logger.LogWarning("Từ chối truy cập: User {UserId} không có quyền thực hiện {Method} trên {Route}",
                userId, httpMethod, normalizedRoute);

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                status = 403,
                error = "Forbidden",
                message = $"Bạn không có quyền thực hiện thao tác [{httpMethod}] trên tài nguyên [{normalizedRoute}]. Vui lòng liên hệ Quản trị viên để được cấp quyền."
            });
            return;
        }

        // ---------------------------------------------------------------------------------
        // BƯỚC 8: Hợp lệ -> Cho phép Request đi tiếp vào Controller / CQRS Handler
        // ---------------------------------------------------------------------------------
        await _next(context);
    }
}
