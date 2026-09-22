using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Auth.Handlers;

public class RevokeRefreshTokenHandler : IRequestHandler<RevokeRefreshTokenCommand, Unit>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public RevokeRefreshTokenHandler(IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<Unit> Handle(RevokeRefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var existing = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken, cancellationToken);
        if (existing == null)
            throw new InvalidOperationException("Refresh token not found");

        existing.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(existing, cancellationToken);

        return Unit.Value;
    }
}
