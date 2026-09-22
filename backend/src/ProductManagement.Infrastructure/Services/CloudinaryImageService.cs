using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Infrastructure.Services;

public class CloudinaryImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService(Microsoft.Extensions.Options.IOptions<CloudinarySettings> settings)
    {
        var s = settings.Value;
        var account = new Account(s.CloudName, s.ApiKey, s.ApiSecret);
        _cloudinary = new Cloudinary(account)
        {
            Api = { Secure = true }
        };
    }

    public async Task<string> UploadAsync(System.IO.Stream imageStream, string fileName, CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, imageStream),
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
        if (result.StatusCode != System.Net.HttpStatusCode.OK && result.StatusCode != System.Net.HttpStatusCode.Created)
        {
            throw new InvalidOperationException($"Image upload failed: {result.Error?.Message}");
        }

        return result.SecureUrl?.ToString() ?? string.Empty;
    }
}
