namespace ProductManagement.Infrastructure.Services;

public class EsmsSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Brandname { get; set; } = "baotrixemay";
    public string SmsType { get; set; } = "2"; // 2: CSKH có Brandname
    public string ApiUrl { get; set; } = "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json";
}
