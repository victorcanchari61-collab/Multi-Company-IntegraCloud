namespace Backend.Domain.IAM.Services;

/// <summary>Cifra/descifra secretos en reposo (credenciales SUNAT).</summary>
public interface ISecretProtector
{
    string Protect(string plaintext);
    string Unprotect(string ciphertext);
}
