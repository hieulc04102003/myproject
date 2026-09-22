using System.IO;
namespace ProductManagement.Application.Common.Interfaces;

public interface IImageService
{
    /// <summary>
    /// Uploads an image stream to cloud provider and returns the secure URL.
    /// </summary>
    Task<string> UploadAsync(Stream imageStream, string fileName, CancellationToken cancellationToken = default);
}
