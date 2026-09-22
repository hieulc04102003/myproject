using MediatR;
namespace ProductManagement.Application.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<ProductManagement.Application.Auth.Responses.AuthResponse>;
