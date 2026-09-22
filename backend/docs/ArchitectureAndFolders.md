# Project architecture & folder guide

This document explains the overall project structure (Clean Architecture) and the purpose of each layer, main folders and important files. Use this as a quick reference when developing features so you know where to add code and how responsibilities are separated.

High-level layers
- Domain: the heart of the system — entities, domain types and domain-specific errors. No dependencies on other projects.
- Application: business rules, DTOs, commands/queries, MediatR handlers, interfaces (abstractions), validation (FluentValidation). Depends on Domain only.
- Infrastructure: framework and external system implementations (EF Core DbContext, repositories, external services like Cloudinary, JWT helper implementations). Depends on Application and Domain.
- WebAPI: the HTTP entrypoint: controllers, API models, Program.cs (startup), middleware (error handling, authentication), Swagger. Depends on Application and Infrastructure via DI.

Folder-by-folder reference (src/)

- ProductManagement.Domain/
  - Entities/: EF/Domain model classes (Product, Order, User, Option, etc.). These are POCOs that represent the core data.
  - Errors/: domain-level error codes/messages used across layers.
  - Purpose: define business objects and invariants. No external framework references.

- ProductManagement.Application/
  - Common/
	- Dto/: response/request DTOs used by handlers and controllers (ProductDto, OrderDto, PagedResult<T>, etc.).
	- Interfaces/: repository/service interfaces (IProductRepository, IUnitOfWork, IImageService). These are implemented in Infrastructure.
  - Products/, Orders/, Auth/ (feature folders)
	- Commands/ (CreateProductCommand.cs, UpdateProductCommand.cs, DeleteProductCommand.cs)
	- Queries/ (GetProductByIdQuery.cs, SearchProductsQuery.cs)
	- Handlers/ (MediatR handlers that implement the business logic for commands/queries)
	- Validators/ (FluentValidation validators for commands/requests)
  - DependencyInjection.cs: registers MediatR and AddValidatorsFromAssembly; central place to register Application services.
  - Purpose: orchestrate business rules, validation, and define contracts (interfaces/DTOs) without depending on EF or external systems.

- ProductManagement.Infrastructure/
  - Persistence/
	- MyProjectContext.cs: EF Core DbContext and IUnitOfWork implementation.
	- Repositories (ProductRepository, OrderRepository, UserRepository, OptionRepository): implement Application interfaces and data access.
	- Migrations/: EF migrations.
  - Services/: implementations for external integrations (CloudinaryImageService, JwtTokenService, mail, etc.).
  - DependencyInjection.cs: registers concrete implementations (repositories, services, HttpClients). Called from WebAPI startup.
  - Purpose: provide concrete implementations for persistence and external dependencies; safe to use EF Core, Cloud SDKs, and configuration-bound services here.

- ProductManagement.WebAPI/
  - Controllers/: API endpoints (ProductsController, OrdersController, AuthController). Controllers should be thin — delegate to MediatR.
  - Middlewares/: global middlewares (GlobalExceptionHandlingMiddleware, request logging, etc.).
  - Program.cs: app startup, DI composition (AddApplication, AddInfrastructure), authentication (JwtBearer), Swagger, CORS, FluentValidation MVC wiring.
  - Properties/launchSettings.json: local launch configuration for Visual Studio.
  - Purpose: host the HTTP API, wire DI, configure auth, and expose endpoints for front-end.

Key patterns and responsibilities
- MediatR (CQRS style): Commands and Queries live in Application; handlers implement logic and use repository interfaces.
- Repositories: expose persistence operations (search, get, add, delete). Prefer returning domain entities to application; mapping to DTOs happens in handlers.
- Unit of Work: MyProjectContext implements IUnitOfWork — call SaveChangesAsync() from handlers when you need to persist changes.
- Validation: FluentValidation validators live in Application and are registered via AddValidatorsFromAssembly. WebAPI is configured to run automatic MVC validation for controller-bound models. Consider adding a MediatR ValidationBehavior if you want validation for MediatR requests invoked outside MVC.
- DTOs: Application.Common.Dto contains shapes returned by endpoints. Keep controllers returning DTOs instead of domain entities.
- Authorization: WebAPI config sets up JwtBearer and role checks. Use [Authorize(Roles = "Admin")] on admin endpoints; for complex rules, add policies and AuthorizationHandlers in WebAPI or a shared Authorization folder.

Where to add code for common tasks
- New feature (e.g., product reviews):
  1. Domain: add new entity if needed.
  2. Application: create commands/queries, DTOs, handlers, validators.
  3. Infrastructure: implement repository methods or new repository for persistence.
  4. WebAPI: add controller endpoints that call MediatR commands/queries.

Conventions and tips
- Keep business rules in Application/Handlers and Domain entities. Controllers only translate HTTP to commands/queries.
- Prefer async Task APIs and pass CancellationToken from controller to MediatR.Send when appropriate.
- Use DTOs to avoid leaking EF tracked entities to the API layer.
- Register new services in the corresponding DependencyInjection.cs and ensure WebAPI Program.cs composes layers with AddApplication() and AddInfrastructure(configuration).
- Add FluentValidation validators in Application/Validators and rely on automatic model validation in WebAPI.

Files of interest to frontend developers
- docs/BackendForFrontend.md — overview of endpoints, DTOs and examples (created earlier).
- Controllers/*.cs — quick view of routes and request/response shapes.
- Application/Common/Dto/* — canonical DTOs used by APIs.

If you want, I can also:
- Generate a small diagram (text) showing request flow through WebAPI -> MediatR -> Handler -> Repository -> DbContext.
- Create a Postman collection or example curl commands for the most-used endpoints.

---
Keep this file near the docs folder; update it when you add new top-level features so frontend developers stay aligned.
