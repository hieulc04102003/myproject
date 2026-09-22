namespace ProductManagement.Application.Common.Interfaces;

public interface IEsmsService
{
    /// <summary>
    /// Gửi mã OTP xác thực tới số điện thoại qua dịch vụ eSMS với Brandname baotrixemay.
    /// </summary>
    Task<(bool Success, string? ErrorMessage)> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);
}
