using MediatR;
using ProductManagement.Application.Auth.Commands;
using ProductManagement.Application.Auth.Responses;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Auth.Handlers;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUserRepository _userRepository;

    public RefreshTokenHandler(IRefreshTokenRepository refreshTokenRepository, IJwtTokenService jwtTokenService, IUserRepository userRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenService = jwtTokenService;
        _userRepository = userRepository;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var existing = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken, cancellationToken);
        if (existing == null)
            throw new InvalidOperationException("Invalid refresh token");

        if (existing.IsRevoked || existing.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidOperationException("Refresh token expired or revoked");

        var user = existing.User;
        if (user == null)
        {
            user = await _userRepository.GetByIdAsync(existing.UserId, cancellationToken);
            if (user == null) throw new InvalidOperationException("User not found");
        }

        // Revoke current refresh token
        existing.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(existing, cancellationToken);

        // RBAC: nạp vai trò từ bảng user_roles trước khi sinh token
        await _userRepository.LoadRolesAsync(user, cancellationToken);

        // Generate new access token and new refresh token
        var newAccessToken = _jwtTokenService.GenerateToken(user.Id, user.Role, user.Email);
        var newRefresh = new ProductManagement.Domain.Entities.RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = null
        };

        await _refreshTokenRepository.AddAsync(newRefresh, cancellationToken);

        return new AuthResponse(user.Id, user.FullName, user.Email ?? string.Empty, user.Role, newAccessToken, newRefresh.Token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
