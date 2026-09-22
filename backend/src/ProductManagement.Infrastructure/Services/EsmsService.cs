using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Infrastructure.Services;

public class EsmsService : IEsmsService
{
    private readonly HttpClient _httpClient;
    private readonly EsmsSettings _settings;
    private readonly ILogger<EsmsService> _logger;

    public EsmsService(HttpClient httpClient, IOptions<EsmsSettings> options, ILogger<EsmsService> logger)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<(bool Success, string? ErrorMessage)> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var cleanPhone = NormalizePhoneNumber(phoneNumber);

        // Mẫu tin nhắn bắt buộc đối với Brandname baotrixemay trên eSMS
        var isBaoTriXeMay = string.Equals(_settings.Brandname?.Trim(), "baotrixemay", StringComparison.OrdinalIgnoreCase);
        var content = isBaoTriXeMay
            ? $"{otpCode} la ma xac minh dang ky Baotrixemay cua ban"
            : $"Ma OTP xac thuc tai khoan cua ban la {otpCode}. Ma co hieu luc trong 5 phut.";

        // Nếu chưa cấu hình ApiKey thật -> ghi log ra console và giả lập
        if (string.IsNullOrWhiteSpace(_settings.ApiKey) || _settings.ApiKey.Contains("YOUR_") ||
            string.IsNullOrWhiteSpace(_settings.SecretKey) || _settings.SecretKey.Contains("YOUR_"))
        {
            _logger.LogWarning("╔════════════════════════════════════════════════════════════════════════════════════════════╗");
            _logger.LogWarning("║ 📱 [eSMS DEV MODE] Chưa cấu hình đầy đủ ApiKey / SecretKey thật                       ║");
            _logger.LogWarning("║ 📞 Số điện thoại: {Phone,-20}                                              ║", cleanPhone);
            _logger.LogWarning("║ 🔑 MÃ OTP TEST  : >>> {Otp,-6} <<<                                                       ║", otpCode);
            _logger.LogWarning("║ 🏷️ Brandname    : {Brand,-20}                                              ║", _settings.Brandname);
            _logger.LogWarning("║ 📝 Nội dung tin : {Content,-70} ║", content);
            _logger.LogWarning("╚════════════════════════════════════════════════════════════════════════════════════════════╝");
            return (false, "Chưa cấu hình ApiKey hoặc SecretKey eSMS thật trong appsettings.json.");
        }

        try
        {
            var payload = new
            {
                ApiKey = (_settings.ApiKey ?? "").Trim(),
                SecretKey = (_settings.SecretKey ?? "").Trim(),
                Phone = cleanPhone,
                Content = content,
                Brandname = (_settings.Brandname ?? "baotrixemay").Trim(),
                SmsType = (_settings.SmsType ?? "2").Trim(),
                IsUnicode = "0"
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync(_settings.ApiUrl, jsonContent, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            _logger.LogInformation("eSMS Raw Response: {Response}", responseBody);

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            var codeResult = root.TryGetProperty("CodeResult", out var codeProp) ? codeProp.GetString() : null;
            var esmsMsg = root.TryGetProperty("ErrorMessage", out var msgProp) ? msgProp.GetString() : null;

            if (codeResult == "100")
            {
                _logger.LogInformation("╔════════════════════════════════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ ✅ [eSMS THÀNH CÔNG] Đã gửi SMS OTP tới số {Phone,-20}               ║", cleanPhone);
                _logger.LogInformation("║ 🏷️ Brandname: {Brand,-20} | SMSID: {SmsId,-30}       ║", _settings.Brandname, root.TryGetProperty("SMSID", out var s) ? s.GetString() : "");
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════════════════════════════════╝");
                return (true, null);
            }

            var friendlyError = codeResult switch
            {
                "101" => "Sai thông tin ApiKey hoặc SecretKey (101 - Authorize Failed). Vui lòng kiểm tra lại SecretKey trong trang Quản lý API của eSMS.vn.",
                "102" => "Tài khoản eSMS chưa được cấu hình bảng giá SMS (102).",
                "103" => "Tài khoản eSMS không đủ số dư để gửi tin nhắn (103 - Không đủ tiền).",
                "104" => $"Brandname '{_settings.Brandname}' không tồn tại trên tài khoản eSMS này (104).",
                "108" => "Số điện thoại không đúng định dạng nhà mạng Việt Nam (108).",
                "146" => "Sai mẫu tin nhắn đã đăng ký cho Brandname (146).",
                _ => $"eSMS phản hồi lỗi: {esmsMsg ?? "Không rõ nguyên nhân"} (CodeResult: {codeResult ?? "N/A"})"
            };

            _logger.LogWarning("╔════════════════════════════════════════════════════════════════════════════════════════════╗");
            _logger.LogWarning("║ ⚠️ [eSMS GỬI TIN THẤT BÀI] {Error,-70} ║", friendlyError);
            _logger.LogWarning("║ 📞 Số điện thoại: {Phone,-20}                                              ║", cleanPhone);
            _logger.LogWarning("║ 🔑 MÃ OTP TEST  : >>> {Otp,-6} <<< (Dùng mã này để tiếp tục kiểm thử)                   ║", otpCode);
            _logger.LogWarning("╚════════════════════════════════════════════════════════════════════════════════════════════╝");

            return (false, friendlyError);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi ngoại lệ khi gọi eSMS Gateway. Mã OTP mô phỏng: {OtpCode}", otpCode);
            return (false, $"Lỗi kết nối tới cổng eSMS: {ex.Message}");
        }
    }

    private static string NormalizePhoneNumber(string phone)
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
