using Backend.Domain.IAM.Services;
using Microsoft.AspNetCore.DataProtection;

namespace Backend.Infrastructure.IAM.Services;

/// <summary>Cifrado en reposo con ASP.NET Core Data Protection.</summary>
public sealed class DataProtectionSecretProtector : ISecretProtector
{
    private readonly IDataProtector _protector;

    public DataProtectionSecretProtector(IDataProtectionProvider provider)
        => _protector = provider.CreateProtector("iam.company-billing-credentials.v1");

    public string Protect(string plaintext) => _protector.Protect(plaintext);

    public string Unprotect(string ciphertext) => _protector.Unprotect(ciphertext);
}
