namespace ProductManagement.Application.Auth.Responses;

public record RegisterResponse(bool Success, string Message, string PhoneNumber, int RetryAfterSeconds);
