using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ProductManagement.Application;

/// <summary>
/// Application Layer Dependency Injection Configuration
/// Extension method để đăng ký tất cả services của Application layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Đăng ký MediatR với tất cả Handlers trong assembly
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);
        });

        // Đăng ký FluentValidation Validators
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
