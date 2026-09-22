using MediatR;

namespace ProductManagement.Application.Products.Commands;

public record UploadProductImageCommand(Guid ProductId, byte[] FileContent, string FileName) : IRequest<string>;
