using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure;

/// <summary>
/// Infrastructure Layer Dependency Injection Configuration
/// Đăng ký tất cả services của Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database Configuration - PostgreSQL
        services.AddDbContext<MyProjectContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(MyProjectContext).Assembly.FullName)));

        // Register Unit of Work
        services.AddScoped<IUnitOfWork>(provider =>
            provider.GetRequiredService<MyProjectContext>());

        // Register Repositories
        // Register Repositories
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IUserRepository, ProductManagement.Infrastructure.Persistence.UserRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IRefreshTokenRepository, ProductManagement.Infrastructure.Persistence.RefreshTokenRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IProductRepository, ProductManagement.Infrastructure.Persistence.ProductRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IOrderRepository, ProductManagement.Infrastructure.Persistence.OrderRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.ICouponRepository, ProductManagement.Infrastructure.Persistence.CouponRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IOptionRepository, ProductManagement.Infrastructure.Persistence.OptionRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IOptionGroupRepository, ProductManagement.Infrastructure.Persistence.OptionGroupRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.ICategoryRepository, ProductManagement.Infrastructure.Persistence.CategoryRepository>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IUserAddressRepository, ProductManagement.Infrastructure.Persistence.UserAddressRepository>();

        // Register Auth services
        services.Configure<ProductManagement.Infrastructure.Services.JwtSettings>(configuration.GetSection("Jwt"));
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IJwtTokenService, ProductManagement.Infrastructure.Services.JwtTokenService>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IPasswordHasher, ProductManagement.Infrastructure.Services.PasswordHasher>();

        // Đăng ký Service phân quyền động theo URL + HTTP Method
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IPermissionService, ProductManagement.Infrastructure.Services.PermissionService>();

        // Register eSMS and OTP services
        services.AddHttpClient();
        services.AddMemoryCache();
        services.Configure<ProductManagement.Infrastructure.Services.EsmsSettings>(configuration.GetSection("Esms"));
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IEsmsService, ProductManagement.Infrastructure.Services.EsmsService>();
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IOtpService, ProductManagement.Infrastructure.Services.OtpService>();

        // Cloudinary image service
        services.Configure<ProductManagement.Infrastructure.Services.CloudinarySettings>(configuration.GetSection("Cloudinary"));
        services.AddScoped<ProductManagement.Application.Common.Interfaces.IImageService, ProductManagement.Infrastructure.Services.CloudinaryImageService>();

        return services;
    }
}
