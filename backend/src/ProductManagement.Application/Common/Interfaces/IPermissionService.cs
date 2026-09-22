using System;
using System.Threading;
using System.Threading.Tasks;

namespace ProductManagement.Application.Common.Interfaces;

/// <summary>
/// Service kiểm tra và truy vấn phân quyền API động dựa trên HTTP Method và URL Route Pattern.
/// Tuân thủ nguyên tắc Clean Architecture (Dependency Inversion): tầng Application định nghĩa interface,
/// tầng Infrastructure triển khai chi tiết truy cập dữ liệu và caching.
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Kiểm tra xem một người dùng (userId) có quyền thực thi HTTP Method trên route pattern cụ thể hay không.
    /// Chuỗi liên kết kiểm tra: User -> UserRole -> Role -> RolePermission -> Permission (HttpMethod + Url).
    /// </summary>
    /// <param name="userId">Id của tài khoản người dùng đăng nhập.</param>
    /// <param name="httpMethod">Phương thức HTTP của request (vd: "GET", "POST", "PUT", "DELETE").</param>
    /// <param name="routePattern">Route template chuẩn của API (vd: "/api/products", "/api/products/{id}").</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    /// <returns>True nếu được cấp quyền hoặc người dùng là Admin; False nếu không có quyền.</returns>
    Task<bool> HasPermissionAsync(Guid userId, string httpMethod, string routePattern, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kiểm tra xem một endpoint cụ thể đã được khai báo và cấu hình kiểm soát quyền trong bảng permissions hay chưa.
    /// Nếu endpoint chưa được cấu hình trong bảng permissions, hệ thống sẽ cho phép đi qua theo chính sách Authorize mặc định.
    /// </summary>
    /// <param name="httpMethod">Phương thức HTTP.</param>
    /// <param name="routePattern">Route template chuẩn hóa.</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    /// <returns>True nếu endpoint này có trong bảng permissions; False nếu chưa được cấu hình.</returns>
    Task<bool> IsEndpointConfiguredAsync(string httpMethod, string routePattern, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xóa bộ nhớ đệm (Cache) phân quyền của người dùng khi có sự thay đổi quyền hoặc gán lại vai trò.
    /// </summary>
    /// <param name="userId">Id của người dùng cần làm mới cache.</param>
    void InvalidateUserPermissionCache(Guid userId);

    /// <summary>
    /// Xóa toàn bộ cache danh sách endpoint của hệ thống khi Admin thêm/sửa/xóa permission trong DB.
    /// </summary>
    void InvalidateSystemEndpointsCache();
}
