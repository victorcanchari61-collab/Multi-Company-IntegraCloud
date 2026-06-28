using System.Net;
using System.Net.Http.Json;
using Backend.Domain.IAM.Services;
using Microsoft.Extensions.Configuration;

namespace Backend.Infrastructure.IAM.Services;

/// <summary>
/// Cliente de apisperu (https://apisperu.com) para consultar RUC/DNI.
/// El token se lee de configuración (ApisPeru:Token) y nunca sale al cliente.
/// </summary>
public sealed class ApisPeruDocumentLookupService(HttpClient httpClient, IConfiguration config)
    : IDocumentLookupService
{
    private string Token => config["ApisPeru:Token"]
        ?? throw new InvalidOperationException("ApisPeru:Token not configured.");

    public async Task<RucInfo?> GetRucAsync(string ruc, CancellationToken ct = default)
    {
        using var res = await httpClient.GetAsync($"ruc/{ruc}?token={Token}", ct);
        if (res.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.UnprocessableEntity)
            return null;
        res.EnsureSuccessStatusCode();

        var dto = await res.Content.ReadFromJsonAsync<ApisPeruRuc>(ct);
        if (dto is null || string.IsNullOrWhiteSpace(dto.RazonSocial))
            return null;

        return new RucInfo(
            dto.Ruc ?? ruc,
            dto.RazonSocial,
            dto.NombreComercial,
            dto.Direccion,
            dto.Estado,
            dto.Condicion,
            dto.Departamento,
            dto.Provincia,
            dto.Distrito);
    }

    public async Task<DniInfo?> GetDniAsync(string dni, CancellationToken ct = default)
    {
        using var res = await httpClient.GetAsync($"dni/{dni}?token={Token}", ct);
        if (res.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.UnprocessableEntity)
            return null;
        res.EnsureSuccessStatusCode();

        var dto = await res.Content.ReadFromJsonAsync<ApisPeruDni>(ct);
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombres))
            return null;

        var nombreCompleto = $"{dto.Nombres} {dto.ApellidoPaterno} {dto.ApellidoMaterno}".Trim();
        return new DniInfo(
            dto.Dni ?? dni,
            dto.Nombres,
            dto.ApellidoPaterno ?? string.Empty,
            dto.ApellidoMaterno ?? string.Empty,
            nombreCompleto);
    }

    // Respuestas crudas del proveedor (JSON camelCase, mapeo case-insensitive).
    private sealed record ApisPeruRuc(
        string? Ruc,
        string? RazonSocial,
        string? NombreComercial,
        string? Direccion,
        string? Estado,
        string? Condicion,
        string? Departamento,
        string? Provincia,
        string? Distrito);

    private sealed record ApisPeruDni(
        string? Dni,
        string? Nombres,
        string? ApellidoPaterno,
        string? ApellidoMaterno);
}
