# Backend - Clean Architecture + CQRS

## 📁 Cấu trúc dự án (Clean Architecture)

```
backend/
├── src/
│   ├── ProductManagement.Domain/           # ⭐ DOMAIN LAYER (Core - No Dependencies)
│   │   ├── Entities/                       # Entity models được scaffold từ PostgreSQL
│   │   │   ├── User.cs
│   │   │   ├── Product.cs
│   │   │   ├── Order.cs
│   │   │   ├── Cart.cs
│   │   │   ├── Category.cs
│   │   │   ├── Coupon.cs
│   │   │   └── ... (17 entities)
│   │   └── Errors/                         # Domain errors cho Result Pattern
│   │       └── DomainError.cs
│   │
│   ├── ProductManagement.Application/      # ⭐ APPLICATION LAYER (Use Cases)
│   │   ├── Products/
│   │   │   ├── Commands/                   # CQRS Commands
│   │   │   │   └── CreateProduct/
│   │   │   │       ├── CreateProductCommand.cs
│   │   │   │       ├── CreateProductCommandHandler.cs
│   │   │   │       └── CreateProductCommandValidator.cs
│   │   │   ├── Queries/                    # CQRS Queries
│   │   │   │   ├── GetProducts/
│   │   │   │   │   ├── GetProductsQuery.cs
│   │   │   │   │   └── GetProductsQueryHandler.cs
│   │   │   │   └── GetProductById/
│   │   │   └── DTOs/
│   │   │       └── ProductDto.cs
│   │   ├── Common/
│   │   │   ├── Interfaces/                 # Repository interfaces
│   │   │   │   ├── IProductRepository.cs
│   │   │   │   └── IUnitOfWork.cs
│   │   │   └── Result.cs                   # Result Pattern
│   │   └── DependencyInjection.cs          # MediatR, FluentValidation setup
│   │
│   ├── ProductManagement.Infrastructure/   # ⭐ INFRASTRUCTURE LAYER (Implementation)
│   │   ├── Persistence/
│   │   │   ├── MyProjectContext.cs         # EF Core DbContext (scaffolded)
│   │   │   ├── Configurations/             # Fluent API configurations (TODO)
│   │   │   └── Repositories/               # Repository implementations (TODO)
│   │   └── DependencyInjection.cs          # EF Core, Repositories setup
│   │
│   └── ProductManagement.WebAPI/           # ⭐ PRESENTATION LAYER (API)
│       ├── Controllers/
│       │   └── ProductsController.cs
│       ├── Middlewares/
│       │   └── GlobalExceptionHandlingMiddleware.cs
│       ├── Program.cs                      # DI Configuration & Middleware Pipeline
│       └── appsettings.json
│
└── ProductManagement.sln

```

## 🎯 Clean Architecture Principles

### 1. **Domain Layer** (Không phụ thuộc gì)
- ✅ **Entities**: 17 entity models được scaffold từ PostgreSQL
- ✅ **Domain Errors**: Cho Result Pattern
- ❌ **KHÔNG** chứa EF Core, không có `[Required]`, `[MaxLength]` attributes
- ❌ **KHÔNG** phụ thuộc bất kỳ layer nào

### 2. **Application Layer** (Chỉ phụ thuộc Domain)
- ✅ **Commands/Queries**: CQRS pattern với MediatR
- ✅ **DTOs**: Data Transfer Objects
- ✅ **Interfaces**: Repository contracts (IProductRepository, IUnitOfWork)
- ✅ **Validators**: FluentValidation
- ✅ **Result Pattern**: Thay thế exception handling

### 3. **Infrastructure Layer** (Implements Application interfaces)
- ✅ **MyProjectContext**: DbContext với 17 DbSets (scaffolded)
- ✅ **PostgreSQL**: Npgsql.EntityFrameworkCore.PostgreSQL
- ⏳ **Repositories**: Cần implement theo interfaces từ Application
- ⏳ **Configurations**: Fluent API configurations (nếu cần customize)

### 4. **WebAPI Layer** (Presentation)
- ✅ **Controllers**: Thin controllers, chỉ routing
- ✅ **Middlewares**: Global exception handling
- ✅ **Program.cs**: DI setup, CORS, Swagger

## 🗄️ Database

**PostgreSQL Connection:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=127.0.0.1;Database=MyProject;Username=postgres;Password=123456"
  }
}
```

**Entities (17 tables):**
- User, RefreshToken, UserAddress
- Category, Product, ProductOptionGroup, ProductReview
- Option, OptionGroup, OrderItemOption
- Cart, CartItem
- Order, OrderItem, OrderStatusHistory
- Coupon, CouponUsage

## 🚀 Scaffold từ Database

Models đã được scaffold bằng lệnh:
```bash
dotnet ef dbcontext scaffold "Host=127.0.0.1;Database=MyProject;Username=postgres;Password=123456" Npgsql.EntityFrameworkCore.PostgreSQL --output-dir Models --force
```

Sau đó đã được **tái cấu trúc đúng Clean Architecture**:
- ✅ Entities → Domain Layer
- ✅ DbContext → Infrastructure Layer
- ✅ Namespaces đã được update

## 📦 Dependencies

### Domain
- **Không có dependency ngoài**

### Application
- MediatR (12.2.0) - CQRS pattern
- FluentValidation (11.9.0) - Validation

### Infrastructure
- Microsoft.EntityFrameworkCore (8.0.0)
- Npgsql.EntityFrameworkCore.PostgreSQL (8.0.0)
- Microsoft.AspNetCore.Authentication.JwtBearer (8.0.0)

### WebAPI
- Swashbuckle.AspNetCore (6.5.0) - Swagger

## ⚠️ TODO

1. ✅ Entities đã scaffold
2. ✅ DbContext đã scaffold và implement IUnitOfWork
3. ⏳ Tạo Repository implementations cho các entities cần thiết
4. ⏳ Tạo CQRS Commands/Queries cho các use cases
5. ⏳ Tạo Controllers cho các endpoints
6. ⏳ Implement JWT Authentication
7. ⏳ Tạo Migrations (nếu cần modify schema)

## 🔥 Next Steps

Bạn muốn tôi làm gì tiếp theo?
- Tạo Repositories cho User, Product, Order?
- Tạo CQRS Commands/Queries cho các features?
- Tạo Authentication/Authorization với JWT?
- Tạo Frontend Next.js?
