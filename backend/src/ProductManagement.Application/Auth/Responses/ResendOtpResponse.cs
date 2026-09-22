namespace ProductManagement.Application.Auth.Responses;

public record ResendOtpResponse(bool Success, string Message, int RetryAfterSeconds);
