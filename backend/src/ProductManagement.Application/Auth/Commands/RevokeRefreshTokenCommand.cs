using MediatR;

namespace ProductManagement.Application.Auth.Commands;

public record RevokeRefreshTokenCommand(string RefreshToken) : IRequest<Unit>;
