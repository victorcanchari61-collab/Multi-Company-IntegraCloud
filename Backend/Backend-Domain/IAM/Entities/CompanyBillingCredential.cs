using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

/// <summary>
/// Credenciales de facturación electrónica de una empresa (SUNAT).
/// Los valores sensibles se guardan YA CIFRADOS (el cifrado se hace en la capa de aplicación).
/// Vive en el schema `secrets`, separado de los datos públicos de la empresa.
/// </summary>
public sealed class CompanyBillingCredential : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string? SolUser { get; private set; }              // cifrado
    public string? SolPassword { get; private set; }          // cifrado
    public string? CertificateContent { get; private set; }   // cifrado (base64 del .pem/.pfx)
    public string? CertificatePassword { get; private set; }  // cifrado
    public string? CertificateFileName { get; private set; }  // plano
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private CompanyBillingCredential() { }

    public CompanyBillingCredential(
        Guid id,
        Guid companyId,
        string? solUser,
        string? solPassword,
        string? certificateContent,
        string? certificatePassword,
        string? certificateFileName)
        : base(id)
    {
        CompanyId = companyId;
        SolUser = solUser;
        SolPassword = solPassword;
        CertificateContent = certificateContent;
        CertificatePassword = certificatePassword;
        CertificateFileName = certificateFileName;
    }

    /// <summary>Actualiza solo los valores no nulos (cada parámetro nulo = "no cambiar").</summary>
    public void Apply(
        string? solUser,
        string? solPassword,
        string? certificateContent,
        string? certificatePassword,
        string? certificateFileName)
    {
        if (solUser is not null) SolUser = solUser;
        if (solPassword is not null) SolPassword = solPassword;
        if (certificateContent is not null) CertificateContent = certificateContent;
        if (certificatePassword is not null) CertificatePassword = certificatePassword;
        if (certificateFileName is not null) CertificateFileName = certificateFileName;
        UpdatedAt = DateTime.UtcNow;
    }
}
