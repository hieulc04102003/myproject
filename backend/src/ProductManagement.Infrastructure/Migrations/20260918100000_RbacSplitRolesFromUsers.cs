using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Jagged arrays

namespace ProductManagement.Infrastructure.Migrations
{
    /// <summary>
    /// RBAC: tách role khỏi bảng users sang roles / user_roles / permissions / role_permissions.
    /// - Tạo 4 bảng mới
    /// - Seed 3 vai trò gốc (CUSTOMER, STAFF, ADMIN) + permissions cơ bản
    /// - Chuyển dữ liệu: mỗi user hiện có -> 1 dòng user_roles theo users.role cũ
    /// - Gán permissions cho từng role
    /// - Cuối cùng xoá cột users.role
    /// </summary>
    [DbContext(typeof(Persistence.MyProjectContext))]
    [Migration("20260918100000_RbacSplitRolesFromUsers")]
    public partial class RbacSplitRolesFromUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Tạo bảng roles
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS roles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                CREATE UNIQUE INDEX IF NOT EXISTS ux_roles_name ON roles(name);
            ");

            // 2. Tạo bảng permissions
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS permissions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    code VARCHAR(100) NOT NULL,
                    description TEXT
                );
                CREATE UNIQUE INDEX IF NOT EXISTS ux_permissions_code ON permissions(code);
            ");

            // 3. Bảng nối user_roles
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS user_roles (
                    user_id UUID NOT NULL,
                    role_id UUID NOT NULL,
                    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
                    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS ix_user_roles_role_id ON user_roles(role_id);
            ");

            // 4. Bảng nối role_permissions
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS role_permissions (
                    role_id UUID NOT NULL,
                    permission_id UUID NOT NULL,
                    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
                    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS ix_role_permissions_permission_id ON role_permissions(permission_id);
            ");

            // 5. Seed vai trò gốc
            migrationBuilder.Sql(@"
                INSERT INTO roles (name, description) VALUES
                    ('CUSTOMER', 'Khách hàng - đặt hàng, quản lý giỏ hàng và hồ sơ cá nhân'),
                    ('STAFF', 'Nhân viên - xử lý đơn hàng, quản lý sản phẩm theo phân công'),
                    ('ADMIN', 'Quản trị viên - toàn quyền hệ thống')
                ON CONFLICT (name) DO NOTHING;
            ");

            // 6. Seed permissions cơ bản (quy ước resource.action)
            migrationBuilder.Sql(@"
                INSERT INTO permissions (code, description) VALUES
                    ('products.view', 'Xem sản phẩm'),
                    ('products.create', 'Tạo sản phẩm'),
                    ('products.update', 'Cập nhật sản phẩm'),
                    ('products.delete', 'Xoá sản phẩm'),
                    ('categories.manage', 'Quản lý danh mục'),
                    ('options.manage', 'Quản lý nhóm topping / tùy chọn'),
                    ('orders.view-own', 'Xem đơn hàng của chính mình'),
                    ('orders.create', 'Tạo đơn hàng'),
                    ('orders.cancel-own', 'Huỷ đơn hàng của chính mình'),
                    ('orders.view-all', 'Xem tất cả đơn hàng'),
                    ('orders.update-status', 'Cập nhật trạng thái đơn hàng'),
                    ('users.manage', 'Quản lý người dùng'),
                    ('coupons.manage', 'Quản lý mã giảm giá'),
                    ('reports.view', 'Xem báo cáo thống kê')
                ON CONFLICT (code) DO NOTHING;
            ");

            // 7. Gán permissions cho role
            //    CUSTOMER: các quyền tự phục vụ
            migrationBuilder.Sql(@"
                INSERT INTO role_permissions (role_id, permission_id)
                SELECT r.id, p.id FROM roles r, permissions p
                WHERE r.name = 'CUSTOMER'
                  AND p.code IN ('products.view', 'orders.view-own', 'orders.create', 'orders.cancel-own')
                ON CONFLICT DO NOTHING;
            ");

            //    STAFF: mọi thứ của CUSTOMER + quản trị vận hành
            migrationBuilder.Sql(@"
                INSERT INTO role_permissions (role_id, permission_id)
                SELECT r.id, p.id FROM roles r, permissions p
                WHERE r.name = 'STAFF'
                  AND p.code IN ('products.view', 'products.create', 'products.update',
                                 'categories.manage', 'options.manage',
                                 'orders.view-own', 'orders.create', 'orders.cancel-own',
                                 'orders.view-all', 'orders.update-status')
                ON CONFLICT DO NOTHING;
            ");

            //    ADMIN: toàn bộ permissions
            migrationBuilder.Sql(@"
                INSERT INTO role_permissions (role_id, permission_id)
                SELECT r.id, p.id FROM roles r, permissions p
                WHERE r.name = 'ADMIN'
                ON CONFLICT DO NOTHING;
            ");

            // 8. CHUYỂN DỮ LIỆU: mỗi user lấy role theo cột users.role cũ
            migrationBuilder.Sql(@"
                INSERT INTO user_roles (user_id, role_id)
                SELECT u.id, r.id
                FROM users u
                JOIN roles r ON UPPER(r.name) = UPPER(u.role)
                ON CONFLICT DO NOTHING;
            ");

            // 9. Xoá cột role cũ khỏi users (kể cả default constraint nếu có)
            migrationBuilder.Sql(@"
                ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
                ALTER TABLE users DROP COLUMN IF EXISTS role;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Khôi phục cột role trên users (mặc định CUSTOMER cho user chưa có role)
            migrationBuilder.Sql(@"
                ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER';
                UPDATE users u SET role = COALESCE((SELECT UPPER(r.name) FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1), 'CUSTOMER');
            ");

            migrationBuilder.Sql("DROP TABLE IF EXISTS role_permissions;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS user_roles;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS permissions;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS roles;");
        }
    }
}
