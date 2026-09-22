# 🥖 BÁNH MÌ SÀI GÒN — Tóm tắt dự án Fullstack

> Hệ thống bán bánh mì & F&B trực tuyến: đặt hàng online, giao hàng nhanh 20 phút, quản trị cửa hàng.
> **Backend:** ASP.NET Core 8 (Clean Architecture + CQRS) · **Frontend:** Next.js 14 (App Router) · **Database:** PostgreSQL

---

## 1. Dự án làm gì? (Business Overview)

Website thương mại điện tử cho quán bánh mì, phục vụ 3 nhóm người dùng:

| Vai trò | Chức năng chính |
|---|---|
| **Khách hàng (CUSTOMER)** | Xem menu, tìm kiếm/lọc sản phẩm, thêm topping, giỏ hàng, đặt hàng, áp mã giảm giá, theo dõi trạng thái đơn, đánh giá sản phẩm, quản lý sổ địa chỉ, đăng ký/đăng nhập bằng SĐT + OTP |
| **Nhân viên (STAFF)** | Quản lý sản phẩm, danh mục, topping, mã giảm giá, kho hàng (stock), Xem và cập nhật trạng thái đơn hàng (xác nhận → đang làm → đang giao → hoàn tất) |
| **Quản trị (ADMIN)** | Quản lý sản phẩm, danh mục, topping, mã giảm giá, kho hàng (stock), người dùng, thống kê doanh thu |

**Điểm nhấn nghiệp vụ:**
- Đặt hàng theo **topping/tùy chọn** (mỗi sản phẩm có nhiều nhóm option, ví dụ: chọn đồ chua, ớt, pate thêm...)
- **Snapshot giá tại thời điểm đặt hàng** — giá trên đơn không thay đổi dù giá sản phẩm thay đổi sau này
- **Quản lý kho tự động**: trừ kho khi đặt, hoàn kho khi huỷ, chống bán quá số lượng (overselling)
- **Xác thực SĐT bằng OTP** gửi qua SMS (ESMS) — đăng nhập không cần mật khẩu phức tạp
- **Mã giảm giá (Coupon)** có nhật ký sử dụng, chống lạm dụng

---

## 2. Kiến trúc tổng thể (Big Picture)

```
┌──────────────┐          ┌──────────────┐
│  FRONTEND (Next.js)  │  HTTP/   │  BACKEND (ASP.NET Core 8)    │
│  localhost:3000      │ ──JWT→   │  localhost:5000              │──→ PostgreSQL
│                      │  JSON    │  REST API + Swagger          │    (17 bảng, UUID)
│  App Router          │          │  Clean Architecture + CQRS   │──→ Cloudinary (ảnh)
│  React Query         │          │  JWT + OTP (SMS ESMS)        │──→ ESMS (SMS OTP)
│  Zustand (cart)      │          │                              │
└──────────────┘          └──────────────┘
```

---

## 3. Backend — Clean Architecture + CQRS

### 3.1. Bốn tầng (layer)

| Tầng | Dự án | Vai trò | Phụ thuộc |
|---|---|---|---|
| **Domain** ⭐ | `ProductManagement.Domain` | 17 entities + domain errors. Lõi thuần nhất, không có dependency nào | Không phụ thuộc gì |
| **Application** ⭐ | `ProductManagement.Application` | Use cases theo CQRS: Commands (ghi) / Queries (đọc), Handlers, DTOs, Validators, Repository interfaces | Chỉ Domain |
| **Infrastructure** | `ProductManagement.Infrastructure` | EF Core DbContext, Repositories, Unit of Work, dịch vụ ngoài (Cloudinary, JWT, SMS, OTP) | Application, Domain |
| **WebAPI** | `ProductManagement.WebAPI` | Controllers (mỏng, chỉ routing), Middleware, CORS, Swagger, cấu hình DI | Application, Infrastructure |

**Luồng dependency (mũi tên chỉ chiều phụ thuộc):**
```
WebAPI → Application → Domain ←── Infrastructure
```
→ Muốn đổi ORM hay database, chỉ sửa Infrastructure — nghiệp vụ không ảnh hưởng. Đây là lợi thế lớn nhất của Clean Architecture.

### 3.2. CQRS với MediatR — mỗi use case là một "hộp"

Thay vì controller chứa toàn bộ logic, mỗi hành động được tách thành 3 file:

```
Products/
├── Commands/CreateProduct/
│   ├── CreateProductCommand.cs          # yêu cầu (input)
│   ├── CreateProductCommandHandler.cs   # xử lý nghiệp vụ
│   └── CreateProductCommandValidator.cs # kiểm tra dữ liệu (FluentValidation)
└── Queries/GetProducts/...
```

Controller chỉ gõ đúng 1 dòng: `await _mediator.Send(command);` → code gọn, dễ test, dễ thêm tính năng.

### 3.3. Các pattern nổi bật

- **Repository Pattern**: mọi truy cập dữ liệu qua `IProductRepository`, `IOrderRepository`, `IUserRepository`... — Application không biết gì về SQL.
- **Unit of Work** (`IUnitOfWork`, implement bởi chính DbContext):
  - `SaveChangesAsync()` — lưu thay đổi
  - `ExecuteInTransactionAsync()` — gom nhiều thao tác vào **một transaction nguyên tử**: hoặc tất cả thành công (commit), hoặc hoàn tác hết (rollback).
  - **Ví dụ thực tế:** khi đặt hàng → trừ kho + tạo đơn + áp coupon trong cùng transaction. Nếu kho không đủ hoặc coupon lỗi → rollback toàn bộ, kho không bao giờ bị trừ oan.
- **Result Pattern**: trả về kết quả/thất bại có kiểm soát thay vì ném exception khắp nơi.
- **JWT Authentication + Refresh Token**: access token ngắn hạn, refresh token lưu DB (có thu hồi/revoke), tự động refresh khi hết hạn.
- **OTP Service**: cooldown 60 giây/lần gửi, hết hạn 5 phút, tối đa 5 lần sai, vô hiệu hoá mã cũ khi cấp mã mới.
- **Global Exception Middleware**: bắt mọi lỗi chưa xử lý, trả response JSON chuẩn (Development kèm chi tiết để debug).
- **CORS**: chỉ cho phép frontend `localhost:3000` gọi API.

### 3.4. Database PostgreSQL — 17 bảng, 5 phân hệ

| Phân hệ | Bảng |
|---|---|
| 👤 Người dùng & Xác thực | `users`, `user_addresses`, `refresh_tokens`, `otps` |
| 🥖 Danh mục & Sản phẩm | `categories`, `products`, `product_option_groups`, `product_reviews` |
| 🧀 Topping/Tùy chọn | `option_groups`, `options`, `order_item_options` |
| 🛒 Giỏ hàng | `carts`, `cart_items` |
| 📦 Đơn hàng & Khuyến mãi | `orders`, `order_items`, `order_status_history`, `coupons`, `coupon_usages` |

**Quyết định thiết kế đáng chú ý:**
- **100% UUID primary key** (thay vì số tự tăng) — chống đoán ID, chống enumeration attack
- **Historical snapshotting** — giá/tên sản phẩm được chụp lại trên từng order_item
- SĐT là **tên đăng nhập chính**, unique
- Extension `pgcrypto` sinh UUID native trong DB
- Sơ đồ ERD đầy đủ (Mermaid) có trong `DATABASE_DOCUMENTATION.md`

### 3.5. Các API Controller

`Auth` (đăng ký, đăng nhập, verify-otp, resend-otp, refresh, revoke) · `Users` (hồ sơ) · `UserAddresses` (sổ địa chỉ CRUD) · `Products` (homepage, tìm kiếm, lọc, phân trang, upload ảnh, CRUD cho ADMIN/STAFF) · `Categories` · `Options` (nhóm topping) · `Orders` (tạo, huỷ, tra cứu, phân trang) · `Admin` (quản lý người dùng, thống kê) · `Proxy` (proxy request ra ngoài)

### 3.6. Tech stack backend

.NET 8 · EF Core 8 + Npgsql (PostgreSQL) · MediatR · FluentValidation · JWT Bearer · CloudinaryDotNet (lưu ảnh) · ESMS API (gửi SMS OTP) · Swagger

---

## 4. Frontend — Next.js 14, Feature-Based Architecture

### 4.1. Cấu trúc thư mục

```
frontend/src/
├── app/          # App Router: homepage, products, cart, checkout, orders, profile, auth, admin, staff
├── features/     # Mỗi tính năng 1 thư mục độc lập (components, api, hooks, types)
│   ├── products/ ├── cart/ ├── orders/ ├── auth/ ├── home/ └── admin/
├── components/   # UI dùng chung (Shadcn UI: button, input, skeleton...; layout: header, footer)
├── lib/          # api-client.ts (Axios + JWT interceptors), utils
├── store/        # Zustand (cart-store, auth-store)
└── types/        # TypeScript types
```

### 4.2. Quản lý state — tách bạch 2 loại

| Loại state | Công cụ | Ví dụ |
|---|---|---|
| **Server state** (dữ liệu từ API) | TanStack Query | `useProducts({ categoryId, search })` — tự caching, loading skeleton, refetch |
| **Client state** (dữ liệu UI) | Zustand + localStorage | Giỏ hàng (`addItem`, badge số lượng), auth store (persist qua F5) |

### 4.3. Điểm nhấn frontend

- **100% TypeScript type-safe** (không dùng `any`)
- **Axios interceptor tự động**: gắn JWT vào mọi request; khi gặp 401 → tự gọi `/auth/refresh` cấp token mới rồi thử lại; nếu refresh fail → xoá token, về trang đăng nhập
- **Responsive**: skeleton loading khi tải sản phẩm, grid 2/4 cột, lazy loading ảnh
- **Homepage**: Hero banner, bộ lọc danh mục (pill tabs), tìm kiếm debounce, lưới sản phẩm, "Why choose us", footer

### 4.4. Tech stack frontend

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS + Shadcn UI · TanStack Query 5 · Zustand 4 · Axios · Lucide Icons

---

## 5. Luồng nghiệp vụ tiêu biểu: ĐẶT HÀNG

```
Khách chọn món + topping → Giỏ hàng (Zustand, lưu localStorage)
   → Checkout: chọn địa chỉ (sổ địa chỉ hoặc nhập mới), nhập coupon
   → POST /api/orders
   → CreateOrderHandler mở TRANSACTION:
        ① Trừ kho từng món (atomic, chống overselling)
           └─ thiếu kho? → THROW → ROLLBACK toàn bộ
        ② Tạo đơn + order_items (snapshot giá)
        ③ Áp coupon + ghi nhật ký coupon_usage
        ④ Lưu địa chỉ giao (nếu nhập mới)
        ⑤ COMMIT → trả OrderDto
   → FE hiện xác nhận, theo dõi trạng thái qua order_status_history
   → Huỷ đơn? → CANCELLED + hoàn kho (cùng transaction)
```

---

## 6. Bảo mật (Security Checklist)

✅ Mật khẩu băm **bcrypt**, không lưu plaintext
✅ **JWT + Refresh Token** có thu hồi (revoke), ghi IP đăng nhập
✅ **OTP**: cooldown, hết hạn, giới hạn số lần sai, vô hiệu hoá mã cũ
✅ **UUID primary key** chống đoán ID
✅ **CORS whitelist** origin
✅ **Authorization theo vai trò** `[Authorize(Roles = "ADMIN,STAFF")]` trên các API nhạy cảm
✅ **Validation 2 lớp**: FluentValidation (Application) + model validation (MVC)
✅ Snapshot giá trên đơn — không tin cậy giá do client gửi lên
✅ Global exception middleware — không lộ chi tiết lỗi ở production

---

## 7. Cách chạy dự án

```bash
# 1. Database PostgreSQL (connection trong appsettings.json)
#    Host=127.0.0.1; Database=MyProject; Username=postgres

# 2. Backend
cd backend/src/ProductManagement.WebAPI
dotnet run
# API + Swagger: http://localhost:5000
# (Tự động apply EF migrations khi khởi động)

# 3. Frontend
cd frontend
npm install
# Tạo .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
# App: http://localhost:3000
```

---

## 8. Vì sao kiến trúc này đáng "khoe"? (Điểm nhấn thuyết trình)

1. **Clean Architecture đúng nghĩa** — dependency chỉ chảy vào trong (Domain độc lập tuyệt đối); dễ test, dễ bảo trì, dễ thay đổi công nghệ
2. **CQRS tách bạch đọc/ghi** — mỗi use case một nơi duy nhất, onboarding thành viên mới rất nhanh
3. **Transaction nguyên tử với Unit of Work** — kho/tiền/hàng không bao giờ lệch dữ liệu
4. **Thiết kế DB có tư duy**: UUID, snapshot giá, chống overselling, index chuyên biệt cho nghiệp vụ
5. **Bảo mật nhiều lớp**: bcrypt, JWT + refresh + revoke, OTP chống spam, CORS, RBAC
6. **Frontend có cấu trúc**: feature-based + state tách server/client → dễ mở rộng
7. **Tài hoá song**: ERD Mermaid, tài liệu DB chi tiết, tài liệu kiến trúc fullstack — minh chứng quy trình làm việc nghiêm túc
