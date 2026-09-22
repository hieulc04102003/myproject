using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProductManagement.Application;
using ProductManagement.Infrastructure;
using ProductManagement.WebAPI.Middlewares;
using ProductManagement.WebAPI.Hubs;
using Microsoft.AspNetCore.SignalR;
using ProductManagement.WebAPI.Services;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// DEPENDENCY INJECTION CONFIGURATION
// ============================================================================

// Add Application Layer (MediatR, FluentValidation)
builder.Services.AddApplication();

// Add Infrastructure Layer (EF Core, Repositories)
builder.Services.AddInfrastructure(builder.Configuration);

// In-memory cache for fast RBAC permission lookups
builder.Services.AddMemoryCache();

// Add Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use camelCase for JSON property names (JavaScript convention)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// FluentValidation MVC integration: enable automatic server-side validation and client-side adapters
// Validators are registered in the Application layer via AddValidatorsFromAssembly
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// Configure JWT settings binding
builder.Services.Configure<ProductManagement.Infrastructure.Services.JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Disable default JWT claim name mapping (prevents "role" → long URI remapping)
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

// Authentication - JWT Bearer
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.MapInboundClaims = false;  // Tắt mapping "role" → URI dài
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            RoleClaimType = "role",
            NameClaimType = "sub"
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // SignalR gửi JWT qua query string (?access_token=...) khi negotiate/WebSocket
                var accessToken = context.Request.Query["access_token"].ToString();
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                    return Task.CompletedTask;
                }

                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrWhiteSpace(authHeader))
                {
                    var token = authHeader.Trim();
                    // Tự động xử lý nếu người dùng gõ hoặc dán: "Bearer ", "bearer ", "brear ", hoặc chỉ dán mỗi token
                    while (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ||
                           token.StartsWith("Brear ", StringComparison.OrdinalIgnoreCase))
                    {
                        var spaceIdx = token.IndexOf(' ');
                        token = spaceIdx >= 0 ? token.Substring(spaceIdx + 1).Trim() : token;
                    }
                    token = token.Trim('"', '\'');
                    if (!string.IsNullOrEmpty(token))
                    {
                        context.Token = token;
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

// Add API Documentation (Swagger) with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Product Management API",
        Version = "v1",
        Description = "Clean Architecture + CQRS Pattern API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Chỉ cần dán chuỗi token vào ô bên dưới (không cần gõ chữ Bearer)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",   // frontend dev
                "http://localhost:5000",   // docker mapped host port
                "https://localhost:5001",  // local HTTPS dev
                "http://localhost:57787"   // local VS swagger (example)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// HttpClient factory for proxying external requests
builder.Services.AddHttpClient();

// SignalR - real-time order status updates
builder.Services.AddSignalR();
builder.Services.AddScoped<ProductManagement.Application.Common.Interfaces.IOrderStatusNotifier, SignalROrderStatusNotifier>();

// ============================================================================
// MIDDLEWARE PIPELINE CONFIGURATION
// ============================================================================

var app = builder.Build();

// Development Environment Configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Product Management API v1");
        options.RoutePrefix = string.Empty; // Swagger UI at root
    });
}

// Global Exception Handling - phải đặt đầu tiên
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

// CORS - phải trước Authorization
app.UseCors("AllowFrontend");

// Xác thực danh tính JWT Bearer
app.UseAuthentication();

// Kiểm tra quyền cơ bản (Xác định User đã đăng nhập)
app.UseAuthorization();

// Middleware kiểm tra phân quyền API động theo (HTTP Method + Route Pattern) từ cơ sở dữ liệu
// Tự động chặn 403 Forbidden nếu người dùng không được gán quyền tương ứng trong DB
app.UseMiddleware<DynamicPermissionMiddleware>();

app.MapControllers();

// SignalR hub endpoint - phải đặt sau UseCors để WebSocket được phép cross-origin
app.MapHub<OrderStatusHub>("/hubs/order-status");

// Apply EF Core migrations at startup (with simple retry loop) when running in container/development
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseMigration");
    try
    {
        var context = services.GetRequiredService<MyProjectContext>();
        var retries = 0;
        while (true)
        {
                try
                {
                    context.Database.Migrate();
                    logger.LogInformation("Database migration applied successfully.");
                    break;
                }
                catch (Exception ex)
                {
                    retries++;
                    // Use structured logging placeholders with matching arguments
                    logger.LogWarning(ex, "Database migration attempt {Attempt} failed. Retrying in 2 seconds...", retries);
                    if (retries >= 10)
                    {
                        logger.LogError(ex, "Database migration failed after {Attempts} attempts.", retries);
                        throw;
                    }
                    Thread.Sleep(TimeSpan.FromSeconds(2));
                }
        }
    }
    catch (Exception ex)
    {
        var logger2 = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseMigration");
        logger2.LogError(ex, "Unexpected error while migrating database.");
        // rethrow so the container logs the failure and exits if necessary
        throw;
    }
}

app.Run();
