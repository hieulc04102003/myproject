using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Responses;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Auth.Handlers;

public class ResendOtpHandler : IRequestHandler<ResendOtpCommand, ResendOtpResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public ResendOtpHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<ResendOtpResponse> Handle(ResendOtpCommand request, CancellationToken cancellationToken)
    {
        var cleanPhone = NormalizePhone(request.Request.PhoneNumber);
        var user = await _userRepository.GetByPhoneNumberAsync(cleanPhone, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy thông tin tài khoản của số điện thoại này.");
        }

        if (user.IsPhoneVerified)
        {
            return new ResendOtpResponse(true, "Số điện thoại này đã được xác thực thành công trước đó. Bạn có thể đăng nhập ngay.", 0);
        }

        var result = await _otpService.GenerateAndSendOtpAsync(cleanPhone, cancellationToken);
        if (!result.Success)
        {
            throw new InvalidOperationException(result.Message);
        }

        return new ResendOtpResponse(true, "Mã OTP mới đã được gửi tới số điện thoại của bạn.", result.RetryAfterSeconds);
    }

    private static string NormalizePhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("84") && digits.Length >= 11)
        {
            digits = "0" + digits.Substring(2);
        }
        return digits;
    }
}
