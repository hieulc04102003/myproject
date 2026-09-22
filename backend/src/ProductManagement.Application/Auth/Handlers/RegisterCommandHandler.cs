using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Responses;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Application.Auth.Handlers;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IOtpService _otpService;

    public RegisterCommandHandler(
        IUserRepository userRepository, 
        IPasswordHasher passwordHasher,
        IOtpService otpService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _otpService = otpService;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;
        var cleanPhone = NormalizePhone(dto.PhoneNumber);

        if (string.IsNullOrWhiteSpace(cleanPhone) || cleanPhone.Length < 9)
        {
            throw new ArgumentException("Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại.");
        }

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        var existing = await _userRepository.GetByPhoneNumberAsync(cleanPhone, cancellationToken);
        if (existing != null)
        {
            if (existing.IsPhoneVerified)
            {
                throw new InvalidOperationException("Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.");
            }

            // Nếu số điện thoại đã đăng ký nhưng CHƯA xác thực OTP -> cập nhật lại mật khẩu và gửi OTP mới
            existing.FullName = dto.FullName;
            existing.PasswordHash = _passwordHasher.Hash(dto.Password);
            existing.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(existing, cancellationToken);

            var resendResult = await _otpService.GenerateAndSendOtpAsync(cleanPhone, cancellationToken);
            return new RegisterResponse(
                true, 
                "Tài khoản chưa được xác thực. Hệ thống đã gửi mã OTP mới tới số điện thoại của bạn.", 
                cleanPhone, 
                resendResult.RetryAfterSeconds);
        }

        // Tạo User mới với IsPhoneVerified = false
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            PhoneNumber = cleanPhone,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            IsActive = true,
            IsPhoneVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        // RBAC: gán vai trò mặc định CUSTOMER qua bảng user_roles
        await _userRepository.AssignRoleAsync(user.Id, "CUSTOMER", replace: true, cancellationToken);

        // Sinh mã và gửi OTP qua eSMS (giới hạn 60s)
        var otpResult = await _otpService.GenerateAndSendOtpAsync(cleanPhone, cancellationToken);

        return new RegisterResponse(
            true, 
            "Đăng ký thành công! Vui lòng nhập mã OTP được gửi tới số điện thoại của bạn để kích hoạt tài khoản.", 
            cleanPhone, 
            otpResult.RetryAfterSeconds);
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
