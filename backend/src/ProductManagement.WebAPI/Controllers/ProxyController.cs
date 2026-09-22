using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;

namespace ProductManagement.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProxyController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ProxyController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    // POST /api/proxy/tlm
    [HttpPost("tlm")]
    public async Task<IActionResult> PostTlm()
    {
        // Read incoming request body
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "https://www.useblackbox.io/tlm")
        {
            Content = new StringContent(body ?? string.Empty, System.Text.Encoding.UTF8, Request.ContentType ?? "application/json")
        };

        // Copy selected headers if needed (e.g., authorization)
        if (Request.Headers.TryGetValue("Authorization", out var auth))
        {
            request.Headers.Authorization = AuthenticationHeaderValue.Parse(auth.ToString());
        }

        var resp = await client.SendAsync(request);
        var respContent = await resp.Content.ReadAsStringAsync();

        return new ContentResult
        {
            StatusCode = (int)resp.StatusCode,
            Content = respContent,
            ContentType = resp.Content.Headers.ContentType?.ToString() ?? "application/json"
        };
    }
}
