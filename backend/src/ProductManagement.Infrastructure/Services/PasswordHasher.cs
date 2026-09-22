using System.Security.Cryptography;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    // PBKDF2 implementation
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 10000;

    public string Hash(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[SaltSize];
        rng.GetBytes(salt);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var key = pbkdf2.GetBytes(KeySize);

        var result = new byte[1 + SaltSize + KeySize];
        result[0] = 0x01; // version
        Buffer.BlockCopy(salt, 0, result, 1, SaltSize);
        Buffer.BlockCopy(key, 0, result, 1 + SaltSize, KeySize);

        return Convert.ToBase64String(result);
    }

    public bool Verify(string hashed, string password)
    {
        var data = Convert.FromBase64String(hashed);
        if (data[0] != 0x01) return false;

        var salt = new byte[SaltSize];
        Buffer.BlockCopy(data, 1, salt, 0, SaltSize);
        var key = new byte[KeySize];
        Buffer.BlockCopy(data, 1 + SaltSize, key, 0, KeySize);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var attempted = pbkdf2.GetBytes(KeySize);

        return CryptographicOperations.FixedTimeEquals(attempted, key);
    }
}
