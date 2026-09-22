using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Responses;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Auth.Handlers;

public class VerifyOtpHandler : IRequestHandler<VerifyOtpCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public VerifyOtpHandler(
        IUserRepository userRepository, 
        IOtpService otpService, 
        IJwtTokenService jwtTokenService, 
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _otpService = otpService;
        _jwtTokenService = jwtTokenService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<AuthResponse> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;
        var cleanPhone = NormalizePhone(dto.PhoneNumber);

        // Xác thực mã OTP
        var isValid = await _otpService.VerifyOtpAsync(cleanPhone, dto.OtpCode, cancellationToken);
        if (!isValid)
        {
            throw new InvalidOperationException("Mã OTP không chính xác hoặc đã hết hạn (quá 5 phút). Vui lòng thử lại hoặc yêu cầu gửi mã mới.");
        }

        var user = await _userRepository.GetByPhoneNumberAsync(cleanPhone, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy thông tin tài khoản của số điện thoại này.");
        }

        // Cập nhật trạng thái đã xác thực
        user.IsPhoneVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // RBAC: nạp vai trò từ bảng user_roles trước khi sinh token
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        // Sinh JWT Token để người dùng đăng nhập ngay lập tức
        var token = _jwtTokenService.GenerateToken(user.Id, user.Role, user.PhoneNumber);

        var refresh = new ProductManagement.Domain.Entities.RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = null
        };

        await _refreshTokenRepository.AddAsync(refresh, cancellationToken);

        return new AuthResponse(user.Id, user.FullName, user.PhoneNumber, user.Role, token, refresh.Token);
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

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
