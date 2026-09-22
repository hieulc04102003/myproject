using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Responses;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Auth.Handlers;

public class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IOtpService _otpService;

    public LoginQueryHandler(
        IUserRepository userRepository, 
        IPasswordHasher passwordHasher, 
        IJwtTokenService jwtTokenService, 
        IRefreshTokenRepository refreshTokenRepository,
        IOtpService otpService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _otpService = otpService;
    }

    public async Task<AuthResponse> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var dto = request.Request;
        var cleanPhone = NormalizePhone(dto.PhoneNumber);

        var user = await _userRepository.GetByPhoneNumberAsync(cleanPhone, cancellationToken);
        if (user == null)
            throw new InvalidOperationException("Số điện thoại hoặc mật khẩu không chính xác.");

        if (!_passwordHasher.Verify(user.PasswordHash, dto.Password))
            throw new InvalidOperationException("Số điện thoại hoặc mật khẩu không chính xác.");

        if (!user.IsActive)
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");

        // Kiểm tra xem số điện thoại đã xác thực OTP chưa
        if (!user.IsPhoneVerified)
        {
            // Tự động kích hoạt gửi lại mã OTP (nếu đủ 60s)
            await _otpService.GenerateAndSendOtpAsync(user.PhoneNumber, cancellationToken);

            throw new InvalidOperationException($"Tài khoản chưa được xác thực số điện thoại. Vui lòng xác thực mã OTP để đăng nhập [REQUIRE_OTP:{user.PhoneNumber}].");
        }

        // RBAC: nạp vai trò từ bảng user_roles trước khi sinh token
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        var token = _jwtTokenService.GenerateToken(user.Id, user.Role, user.PhoneNumber);

        // create and persist refresh token
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
