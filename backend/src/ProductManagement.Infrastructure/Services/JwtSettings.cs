namespace ProductManagement.Infrastructure.Services;

public class JwtSettings
{
    public string Issuer { get; set; } = "MyApp";
    public string Audience { get; set; } = "MyAppAudience";
    public string Secret { get; set; } = "ReplaceWithStrongSecretKey";
    public int ExpirationMinutes { get; set; } = 60;
}
