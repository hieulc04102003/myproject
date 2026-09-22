namespace ProductManagement.Application.Common.Interfaces;

public interface IOtpService
{
    /// <summary>
    /// Sinh và gửi mã OTP 6 số tới số điện thoại qua eSMS.
    /// Áp dụng giới hạn: tối thiểu 60 giây mới được gửi lại 1 lần.
    /// Trả về: Success = true nếu đã gửi, false nếu chưa đủ 60s (kèm RetryAfterSeconds).
    /// </summary>
    Task<(bool Success, string Message, int RetryAfterSeconds, string? OtpCode)> GenerateAndSendOtpAsync(string phoneNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xác thực mã OTP người dùng nhập vào.
    /// </summary>
    Task<bool> VerifyOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);
}
