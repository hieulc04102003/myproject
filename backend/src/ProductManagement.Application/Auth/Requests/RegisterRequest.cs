namespace ProductManagement.Application.Auth.Requests;

public record RegisterRequest(string FullName, string PhoneNumber, string Password, string? Email = null);
