namespace Backend.Domain.IAM.Services;

/// <summary>Datos de un RUC consultado en SUNAT (vía proveedor externo).</summary>
public sealed record RucInfo(
    string Ruc,
    string RazonSocial,
    string? NombreComercial,
    string? Direccion,
    string? Estado,
    string? Condicion,
    string? Departamento,
    string? Provincia,
    string? Distrito);

/// <summary>Datos de un DNI consultado en RENIEC (vía proveedor externo).</summary>
public sealed record DniInfo(
    string Dni,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    string NombreCompleto);

/// <summary>
/// Consulta de documentos de identidad peruanos (RUC/DNI) contra un proveedor externo.
/// El token del proveedor vive en el backend; el frontend nunca lo ve.
/// </summary>
public interface IDocumentLookupService
{
    Task<RucInfo?> GetRucAsync(string ruc, CancellationToken ct = default);
    Task<DniInfo?> GetDniAsync(string dni, CancellationToken ct = default);
}
