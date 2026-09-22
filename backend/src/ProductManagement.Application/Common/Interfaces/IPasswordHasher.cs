namespace ProductManagement.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string hashed, string password);
}
