using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;

/// <summary>
/// Triển khai nghiệp vụ phân quyền API dựa trên HTTP Method và URL Route Pattern.
/// Tích hợp IMemoryCache để đảm bảo tốc độ phản hồi cực nhanh trên từng request.
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly MyProjectContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PermissionService> _logger;

    // Định nghĩa tiền tố và thời gian sống của Cache
    private const string SystemEndpointsCacheKey = "system_configured_api_endpoints";
    private const string UserPermsCacheKeyPrefix = "user_api_perms_";
    private static readonly TimeSpan SystemCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan UserCacheDuration = TimeSpan.FromMinutes(5);

    public PermissionService(
        MyProjectContext context,
        IMemoryCache cache,
        ILogger<PermissionService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Kiểm tra người dùng có quyền gọi API với HTTP Method và Route Pattern hay không.
    /// Flow: Kiểm tra Role ADMIN -> Đọc Cache quyền User -> Nếu miss cache thì query DB -> So khớp Method + Url.
    /// </summary>
    public async Task<bool> HasPermissionAsync(Guid userId, string httpMethod, string routePattern, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(httpMethod) || string.IsNullOrWhiteSpace(routePattern))
            return false;

        var normalizedMethod = httpMethod.Trim().ToUpperInvariant();
        var normalizedRoute = "/" + routePattern.Trim().TrimStart('/').ToLowerInvariant();

        // 1. Kiểm tra nếu người dùng sở hữu vai trò 'ADMIN' thì toàn quyền truy cập (Bypass check chi tiết)
        var isAdmin = await IsUserAdminAsync(userId, cancellationToken);
        if (isAdmin)
        {
            return true;
        }

        // 2. Lấy danh sách quyền API được phân cho User từ MemoryCache (tránh truy vấn DB liên tục)
        var userCacheKey = $"{UserPermsCacheKeyPrefix}{userId}";
        if (!_cache.TryGetValue(userCacheKey, out HashSet<string>? userEndpoints))
        {
            // Truy vấn database: User -> UserRoles -> Roles -> RolePermissions -> Permissions
            // Lọc ra các Permission có khai báo HttpMethod và Url
            var dbPerms = await _context.UserRoles
                .AsNoTracking()
                .Where(ur => ur.UserId == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission)
                .Where(p => p.HttpMethod != null && p.Url != null)
                .Select(p => new
                {
                    Method = p.HttpMethod!.Trim().ToUpper(),
                    Url = "/" + p.Url!.Trim().TrimStart('/').ToLower()
                })
                .ToListAsync(cancellationToken);

            // Lưu trữ dưới dạng tập hợp "METHOD:ROUTE" để tìm kiếm với độ phức tạp O(1)
            userEndpoints = new HashSet<string>(
                dbPerms.Select(p => $"{p.Method}:{p.Url}"),
                StringComparer.OrdinalIgnoreCase
            );

            _cache.Set(userCacheKey, userEndpoints, UserCacheDuration);
        }

        // 3. So khớp: khớp chính xác phương thức (vd "POST:/api/products") hoặc wildcard "*" (vd "*:/api/products")
        var targetKey = $"{normalizedMethod}:{normalizedRoute}";
        var wildcardKey = $"*:{normalizedRoute}";

        var hasAccess = userEndpoints != null &&
                        (userEndpoints.Contains(targetKey) || userEndpoints.Contains(wildcardKey));

        return hasAccess;
    }

    /// <summary>
    /// Kiểm tra endpoint có được đăng ký trong bảng permissions hay không.
    /// Nếu endpoint chưa được cấu hình, hệ thống sẽ bỏ qua bước chặn URL để không phá vỡ các API phụ.
    /// </summary>
    public async Task<bool> IsEndpointConfiguredAsync(string httpMethod, string routePattern, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(httpMethod) || string.IsNullOrWhiteSpace(routePattern))
            return false;

        var normalizedMethod = httpMethod.Trim().ToUpperInvariant();
        var normalizedRoute = "/" + routePattern.Trim().TrimStart('/').ToLowerInvariant();

        // Lấy danh sách toàn bộ endpoint đã cấu hình từ Cache
        if (!_cache.TryGetValue(SystemEndpointsCacheKey, out HashSet<string>? systemEndpoints))
        {
            var dbEndpoints = await _context.Permissions
                .AsNoTracking()
                .Where(p => p.HttpMethod != null && p.Url != null)
                .Select(p => new
                {
                    Method = p.HttpMethod!.Trim().ToUpper(),
                    Url = "/" + p.Url!.Trim().TrimStart('/').ToLower()
                })
                .ToListAsync(cancellationToken);

            systemEndpoints = new HashSet<string>(
                dbEndpoints.Select(p => $"{p.Method}:{p.Url}"),
                StringComparer.OrdinalIgnoreCase
            );

            _cache.Set(SystemEndpointsCacheKey, systemEndpoints, SystemCacheDuration);
        }

        var targetKey = $"{normalizedMethod}:{normalizedRoute}";
        var wildcardKey = $"*:{normalizedRoute}";

        return systemEndpoints != null &&
               (systemEndpoints.Contains(targetKey) || systemEndpoints.Contains(wildcardKey));
    }

    /// <summary>
    /// Xóa cache quyền của User khi User được gán Role mới hoặc phân quyền thay đổi.
    /// </summary>
    public void InvalidateUserPermissionCache(Guid userId)
    {
        var cacheKey = $"{UserPermsCacheKeyPrefix}{userId}";
        _cache.Remove(cacheKey);
        _cache.Remove($"is_admin_{userId}");
        _logger.LogInformation("Đã làm mới bộ nhớ đệm phân quyền cho User: {UserId}", userId);
    }

    /// <summary>
    /// Xóa cache danh mục API endpoint toàn hệ thống khi Admin thêm/sửa/xóa bảng permissions.
    /// </summary>
    public void InvalidateSystemEndpointsCache()
    {
        _cache.Remove(SystemEndpointsCacheKey);
        _logger.LogInformation("Đã làm mới bộ nhớ đệm danh mục API toàn hệ thống.");
    }

    /// <summary>
    /// Hàm phụ trợ kiểm tra người dùng có quyền ADMIN hay không (có cache ngắn hạn 5 phút).
    /// </summary>
    private async Task<bool> IsUserAdminAsync(Guid userId, CancellationToken cancellationToken)
    {
        var adminCacheKey = $"is_admin_{userId}";
        if (_cache.TryGetValue(adminCacheKey, out bool isAdmin))
        {
            return isAdmin;
        }

        isAdmin = await _context.UserRoles
            .AsNoTracking()
            .AnyAsync(ur => ur.UserId == userId && ur.Role.Name.ToUpper() == "ADMIN", cancellationToken);

        _cache.Set(adminCacheKey, isAdmin, TimeSpan.FromMinutes(5));
        return isAdmin;
    }
}
