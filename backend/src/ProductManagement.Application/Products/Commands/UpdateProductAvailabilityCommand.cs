using MediatR;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Products.Commands;

public record UpdateProductAvailabilityCommand(Guid Id, bool? IsAvailable, bool? IsFeatured) : IRequest<ProductDto?>;
