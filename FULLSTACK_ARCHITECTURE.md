# Fullstack Architecture - Bánh Mì Sài Gòn

Dự án Fullstack Production-Ready với ASP.NET Core (Clean Architecture + CQRS) và Next.js 14 (App Router + Feature-Based Architecture).

## 📁 Tổng quan cấu trúc

```
MyProjectHiNet/
├── backend/                           # ASP.NET Core Backend
│   ├── src/
│   │   ├── ProductManagement.Domain/          # ⭐ DOMAIN LAYER
│   │   │   ├── Entities/                      # 17 entities từ PostgreSQL
│   │   │   │   ├── User.cs
│   │   │   │   ├── Product.cs
│   │   │   │   ├── Order.cs
│   │   │   │   ├── Cart.cs
│   │   │   │   ├── Category.cs
│   │   │   │   └── ... (12 entities khác)
│   │   │   └── Errors/
│   │   │       └── DomainError.cs
│   │   │
│   │   ├── ProductManagement.Application/     # ⭐ APPLICATION LAYER
│   │   │   ├── Products/
│   │   │   │   ├── Commands/                  # CQRS Commands
│   │   │   │   ├── Queries/                   # CQRS Queries
│   │   │   │   └── DTOs/
│   │   │   └── Common/
│   │   │       ├── Interfaces/
│   │   │       └── Result.cs
│   │   │
│   │   ├── ProductManagement.Infrastructure/  # ⭐ INFRASTRUCTURE LAYER
│   │   │   ├── Persistence/
│   │   │   │   ├── MyProjectContext.cs        # EF Core DbContext
│   │   │   │   ├── Configurations/
│   │   │   │   └── Repositories/
│   │   │   └── DependencyInjection.cs
│   │   │
│   │   └── ProductManagement.WebAPI/          # ⭐ PRESENTATION LAYER
│   │       ├── Controllers/
│   │       ├── Middlewares/
│   │       ├── Program.cs
│   │       └── appsettings.json
│   │
│   ├── ProductManagement.sln
│   └── README.md
│
└── frontend/                          # Next.js 14 Frontend
    ├── src/
    │   ├── app/                       # App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx              # Homepage
    │   │   ├── providers.tsx
    │   │   └── globals.css
    │   │
    │   ├── features/                  # Feature-based architecture
    │   │   └── home/
    │   │       ├── components/        # Feature components
    │   │       │   ├── hero-banner.tsx
    │   │       │   ├── category-filter.tsx
    │   │       │   ├── product-card.tsx
    │   │       │   ├── product-grid.tsx
    │   │       │   ├── search-bar.tsx
    │   │       │   ├── why-choose-us.tsx
    │   │       │   └── home-content.tsx
    │   │       ├── hooks/             # React Query hooks
    │   │       │   └── use-products.ts
    │   │       └── api/               # API services
    │   │           └── product-service.ts
    │   │
    │   ├── components/                # Shared components
    │   │   ├── ui/                    # Shadcn UI
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── badge.tsx
    │   │   │   └── skeleton.tsx
    │   │   └── layout/
    │   │       ├── header.tsx
    │   │       └── footer.tsx
    │   │
    │   ├── lib/                       # Utilities
    │   │   ├── utils.ts
    │   │   └── api-client.ts         # Axios với JWT
    │   │
    │   ├── store/                     # Zustand
    │   │   └── cart-store.ts
    │   │
    │   └── types/                     # TypeScript types
    │       ├── product.ts
    │       ├── cart.ts
    │       └── user.ts
    │
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── README.md
```

---

## 🎯 BACKEND: Clean Architecture + CQRS

### Database: PostgreSQL
- **17 Tables** đã được scaffold thành entities
- Connection: `Host=127.0.0.1;Database=MyProject;Username=postgres;Password=123456`

### Entities (Domain Layer)
```
User, RefreshToken, UserAddress
Product, Category, ProductOptionGroup, ProductReview
Option, OptionGroup, OrderItemOption
Cart, CartItem
Order, OrderItem, OrderStatusHistory
Coupon, CouponUsage
```

### Tech Stack
- **.NET 8.0**
- **EF Core 8.0** với Npgsql
- **MediatR** (CQRS pattern)
- **FluentValidation**
- **Result Pattern** (thay exception)
- **JWT Authentication**

### Dependency Flow
```
WebAPI → Application → Domain ←─── Infrastructure
  ↓         ↓           ↑              ↑
  └─────────┴───────────┴──────────────┘
           (Dependency Injection)
```

### Chạy Backend
```bash
cd backend/src/ProductManagement.WebAPI
dotnet restore
dotnet run
# API: https://localhost:5001
# Swagger: https://localhost:5001
```

---

## 🎨 FRONTEND: Next.js 14 App Router

### Homepage Sections
1. **Header** - Logo, Search (debounce), Cart badge, User menu
2. **Hero Banner** - CTA, quality badges, trust indicators
3. **Category Filter** - Pill tabs cho filtering
4. **Product Grid** - 2/4 columns responsive, lazy loading
5. **Why Choose Us** - 4 benefit cards
6. **Footer** - Contact info, social links

### Tech Stack
- **Next.js 14** (App Router)
- **TypeScript** (100% type-safe, no `any`)
- **Tailwind CSS** + Shadcn UI
- **TanStack Query** (Server state)
- **Zustand** (Cart state với localStorage)
- **Axios** (API client với JWT interceptors)
- **Lucide React** (Icons)

### State Management

#### Cart (Zustand + localStorage)
```typescript
const addItem = useCartStore((state) => state.addItem);
addItem(product, selectedOptions, quantity);
```

#### Products (TanStack Query)
```typescript
const { data, isLoading } = useProducts({ categoryId, search });
```

### Chạy Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

---

## 🔗 API Integration

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=127.0.0.1;Database=MyProject;Username=postgres;Password=123456"
  }
}
```

### API Endpoints (TODO)
```
GET  /api/products              - List products
GET  /api/products/{id}         - Get product detail
GET  /api/categories            - List categories
POST /api/cart                  - Add to cart
POST /api/orders                - Create order
POST /api/auth/login            - Login
POST /api/auth/register         - Register
```

---

## 🚀 Full Development Setup

### 1. Database (PostgreSQL)
```bash
# Đã có database "MyProject" với 17 tables
# Connection string đã config trong appsettings.json
```

### 2. Backend
```bash
cd backend/src/ProductManagement.WebAPI
dotnet restore
dotnet run
# API chạy tại: https://localhost:5001
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local với API URL
npm run dev
# App chạy tại: http://localhost:3000
```

### 4. Test Homepage
- Mở: http://localhost:3000
- Kiểm tra: Hero, Category filter, Product grid (với skeleton loading)
- Cart: Thêm sản phẩm, xem badge update

---

## 📋 TODO Features

### Backend
- [ ] Implement Repositories cho tất cả entities
- [ ] CQRS Commands/Queries cho User, Order, Cart
- [ ] JWT Authentication flow
- [ ] Authorization policies
- [ ] Unit tests

### Frontend
- [ ] Cart Drawer/Modal
- [ ] Product Customization Modal (chọn toppings)
- [ ] Authentication pages (Login/Register)
- [ ] Checkout flow
- [ ] Order history
- [ ] User profile
- [ ] Responsive optimizations

---

## 🏗️ Architecture Principles

### Backend (Clean Architecture)
✅ **Domain** không phụ thuộc gì  
✅ **Application** chỉ phụ thuộc Domain  
✅ **Infrastructure** implements Application interfaces  
✅ **WebAPI** thin controllers, chỉ routing  

### Frontend (Feature-Based)
✅ **Server Components** mặc định (SSR)  
✅ **'use client'** chỉ khi cần interactivity  
✅ **Feature folders** (home, products, auth...)  
✅ **Type-safe** 100%, không dùng `any`  

---

## 📊 Performance Optimizations

### Backend
- EF Core query optimization
- Response caching
- Pagination for large datasets
- Async/await everywhere

### Frontend
- Next/Image lazy loading
- Skeleton loading states
- TanStack Query caching (staleTime, refetch policies)
- Debounced search (500ms)
- localStorage persist cho cart

---

## 🎉 Kết luận

Dự án đã được setup hoàn chỉnh với:
- ✅ Backend Clean Architecture đúng chuẩn
- ✅ 17 Entities đã scaffold từ PostgreSQL
- ✅ Frontend Next.js 14 App Router
- ✅ Homepage production-ready với tất cả sections
- ✅ Type-safe toàn bộ (TypeScript + C#)
- ✅ State management (Zustand + TanStack Query)
- ✅ Responsive mobile-first design

**Bước tiếp theo**: Implement API endpoints ở backend và integrate với frontend!
