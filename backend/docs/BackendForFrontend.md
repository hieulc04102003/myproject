# Backend overview for Frontend developers

This document summarizes the backend APIs, authentication, request/response shapes and conventions so the frontend team can implement UI quickly. The backend follows Clean Architecture (Domain / Application / Infrastructure / WebAPI) and targets .NET 8.

Base URL
- When running locally: http://localhost:{port} (Swagger UI is available at the app root in development)

Authentication
- JWT Bearer authentication is used.
- Endpoints (example):
  - POST /api/auth/register  — register a user
  - POST /api/auth/login     — returns access token and refresh token
  - POST /api/auth/refresh   — exchange refresh token for new access token
- Include Authorization header on protected requests:
  - Authorization: Bearer {access_token}
- Roles: Admin, (other roles as implemented). Use role claim to restrict Admin-only endpoints.

Common conventions
- JSON request/response and standard HTTP status codes:
  - 200 OK for successful GET/PUT
  - 201 Created for successful POST that creates a resource (CreatedAtAction link provided)
  - 204 No Content for successful DELETE
  - 400 Bad Request for validation errors (FluentValidation messages returned)
  - 401 Unauthorized when no/invalid token
  - 403 Forbidden when token valid but role/permission denied
  - 404 Not Found when resource missing
- Pagination params: page (default 1), pageSize (default 10)
- Sorting: sortBy (price/name/updatedAt), sortDir (asc/desc)

Swagger / Testing
- Swagger is enabled in Development. Visit /swagger/index.html (or root) to explore APIs and test endpoints.

CORS
- Dev origins allowed: http://localhost:3000, http://localhost:5000, https://localhost:5001, and other local URLs. If your frontend runs on a different port add it to CORS or run through proxy.

Key API areas

1) Products
- Routes (ProductsController):
  - GET /api/products/homepage?page=&pageSize=&sortBy=&sortDir=
	- Returns featured products (paged). Response: PagedResult<ProductDto>
  - GET /api/products/search?q=&categoryId=&slug=&isAvailable=&minPrice=&maxPrice=&page=&pageSize=&sortBy=&sortDir=
	- Search products. Response: PagedResult<ProductDto>
  - GET /api/products/{id}
	- Get single product by id. If product has IsAvailable == false, only Admin role may view it.
  - POST /api/products
	- Create product (Admin only). Request: ProductCreationRequest JSON. Response: 201 Created with ProductDto.
  - PUT /api/products/{id}
	- Update product (Admin only). Request: ProductCreationRequest JSON. Response: 200 OK with ProductDto.
  - DELETE /api/products/{id}
	- Delete product (Admin only). Response: 204 No Content.
  - POST /api/products/{id}/image
	- Upload product image (multipart/form-data with file). Returns image URL string.

- DTO: ProductDto
  - { id, name, slug, basePrice, imageUrl, isAvailable, isFeatured }

- Create / Update request shape (ProductCreationRequest):
  - { "name": string, "categoryId": Guid, "slug": string, "description": string|null, "basePrice": decimal, "isAvailable": bool|null, "isFeatured": bool|null }

2) Options / Toppings
- GET /api/products/options/groups
  - Returns available option groups and options for product customization.

3) Orders
- Typical endpoints (implemented as CQRS via MediatR):
  - POST /api/orders  — create order (request validated with FluentValidation)
  - GET /api/orders/{id} — get order details (users can only view own orders; Admin can view any)
  - GET /api/orders?page=&pageSize=&status=&from=&to= — paged list (user-scoped unless Admin)

- Order creation notes:
  - CreateOrderRequest contains userId, items (productId, quantity, optionIds[]), payment info, optional coupon code
  - Validation is enforced server-side; invalid payloads return 400 with validation details
  - Order creation is transactional: product stock and coupon usage will be adjusted atomically

4) Authentication & Users
- POST /api/auth/register — create an account
- POST /api/auth/login — returns access_token and refresh_token
- Admin endpoints for users exist (e.g., GET /api/admin/users) — require Admin role

Validation
- FluentValidation is used in the Application layer. Common validators:
  - CreateProductCommandValidator (name, slug format, slug uniqueness check)
  - CreateOrderRequestValidator
- Validation errors return 400 with details from FluentValidation.

Images
- Images are uploaded to a cloud provider (Cloudinary). Image upload endpoint returns a canonical public URL stored in product.ImageUrl.

Errors and logging
- Global exception handling middleware maps domain and validation errors to proper HTTP responses.
- Check response bodies for { errors: [...] } or standard validation format when a 400 is returned.

Developer tips
- Use Swagger to inspect request/response models and to get example payloads.
- Authenticate via /api/auth/login and paste the Bearer token into Swagger "Authorize" button to test protected endpoints.
- For create/update product flows, ensure slug is unique; the backend checks this and will return validation error if duplicate.
- If you need additional fields in DTOs (category name, option metadata), request them — currently only IDs and basic product fields are exposed.

Contact
- For backend questions or new fields, contact the backend owner or open an issue in the repository. I can add API examples or Postman collection if you prefer.

---
Generated automatically to help frontend development. If you want, I can also add a small Postman collection or example curl requests for each endpoint.
