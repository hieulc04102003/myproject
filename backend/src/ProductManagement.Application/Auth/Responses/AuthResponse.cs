namespace ProductManagement.Application.Auth.Responses;

public record AuthResponse(Guid UserId, string FullName, string Email, string Role, string Token, string RefreshToken);
