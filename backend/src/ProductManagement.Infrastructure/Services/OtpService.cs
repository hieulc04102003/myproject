using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;

public class OtpService : IOtpService
{
    private readonly MyProjectContext _context;
    private readonly IMemoryCache _cache;
    private readonly IEsmsService _esmsService;
    private readonly ILogger<OtpService> _logger;
    private const int ResendCooldownSeconds = 60;
    private const int OtpExpiryMinutes = 5;
    private const int MaxFailedAttempts = 5;

    public OtpService(
        MyProjectContext context,
        IMemoryCache cache,
        IEsmsService esmsService,
        ILogger<OtpService> logger)
    {
        _context = context;
        _cache = cache;
        _esmsService = esmsService;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int RetryAfterSeconds, string? OtpCode)> GenerateAndSendOtpAsync(
        string phoneNumber,
        CancellationToken cancellationToken = default)
    {
        var cleanPhone = NormalizePhone(phoneNumber);
        if (string.IsNullOrWhiteSpace(cleanPhone))
        {
            return (false, "Số điện thoại không hợp lệ.", 0, null);
        }

        var now = DateTime.UtcNow;

        // 1. Kiểm tra Cooldown 60s từ Database (bản ghi gần nhất của số điện thoại)
        var latestOtp = await _context.Otps
            .Where(o => o.PhoneNumber == cleanPhone)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestOtp != null)
        {
            var elapsed = now - latestOtp.LastSentAt;
            if (elapsed.TotalSeconds < ResendCooldownSeconds)
            {
                var remaining = ResendCooldownSeconds - (int)elapsed.TotalSeconds;
                return (false, $"Vui lòng đợi {remaining} giây trước khi gửi lại mã OTP.", remaining, null);
            }

            // Vô hiệu hóa mã cũ chưa dùng trước khi sinh mã mới
            if (!latestOtp.IsUsed)
            {
                latestOtp.IsUsed = true;
            }
        }

        // 2. Sinh mã OTP ngẫu nhiên 6 chữ số (100000 - 999999)
        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");

        // 3. Tạo bản ghi mới trong bảng otps
        var otpEntity = new Otp
        {
            Id = Guid.NewGuid(),
            PhoneNumber = cleanPhone,
            OtpCode = otpCode,
            IsUsed = false,
            AttemptsCount = 0,
            CreatedAt = now,
            LastSentAt = now,
            ExpiresAt = now.AddMinutes(OtpExpiryMinutes)
        };

        _context.Otps.Add(otpEntity);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Đã lưu mã OTP vào Database cho số {Phone}: {OtpCode} (ID: {Id})", cleanPhone, otpCode, otpEntity.Id);

        // 4. Gửi qua eSMS Gateway
        var (esmsSuccess, esmsError) = await _esmsService.SendOtpAsync(cleanPhone, otpCode, cancellationToken);

        if (esmsSuccess)
        {
            return (true, "Mã OTP đã được gửi đến số điện thoại của bạn qua SMS.", ResendCooldownSeconds, otpCode);
        }

        // Nếu eSMS báo lỗi (do sai SecretKey hoặc hết số dư), trả về kèm thông báo lỗi chi tiết và mã OTP test
        return (true, $"Mã OTP đã tạo ({esmsError}). Mã OTP để test: {otpCode}", ResendCooldownSeconds, otpCode);
    }

    public async Task<bool> VerifyOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var cleanPhone = NormalizePhone(phoneNumber);
        if (string.IsNullOrWhiteSpace(cleanPhone) || string.IsNullOrWhiteSpace(otpCode))
        {
            return false;
        }

        var now = DateTime.UtcNow;

        // Tìm mã OTP mới nhất còn hiệu lực trong Database
        var otpRecord = await _context.Otps
            .Where(o => o.PhoneNumber == cleanPhone && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (otpRecord == null)
        {
            _logger.LogWarning("Không tìm thấy mã OTP khả dụng cho số {Phone}", cleanPhone);
            return false;
        }

        // Kiểm tra quá hạn
        if (now > otpRecord.ExpiresAt)
        {
            otpRecord.IsUsed = true; // Đánh dấu đã hết hạn
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogWarning("Mã OTP đã quá hạn cho số {Phone}", cleanPhone);
            return false;
        }

        // Kiểm tra số lần nhập sai quá 5 lần (Brute-force protection)
        if (otpRecord.AttemptsCount >= MaxFailedAttempts)
        {
            otpRecord.IsUsed = true; // Khóa mã này
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogWarning("Mã OTP bị khóa do nhập sai quá {Max} lần cho số {Phone}", MaxFailedAttempts, cleanPhone);
            return false;
        }

        // So khớp mã
        if (string.Equals(otpRecord.OtpCode.Trim(), otpCode.Trim(), StringComparison.Ordinal))
        {
            // Xác thực thành công: Đánh dấu mã đã sử dụng
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Xác thực OTP thành công từ Database cho số {Phone}", cleanPhone);
            return true;
        }

        // Nhập sai mã: Tăng attempts count
        otpRecord.AttemptsCount++;
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogWarning("Mã OTP không chính xác cho số {Phone}. Lần sai: {Attempts}/{Max}", cleanPhone, otpRecord.AttemptsCount, MaxFailedAttempts);
        return false;
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
