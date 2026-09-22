namespace ProductManagement.Application.Auth.Requests;

public record VerifyOtpRequest(string PhoneNumber, string OtpCode);
