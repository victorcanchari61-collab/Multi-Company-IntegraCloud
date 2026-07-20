namespace Backend.Application.IAM.DTOs;

/// <summary>Datos públicos de marca de una empresa, para pintar el login por subdominio.</summary>
public sealed record CompanyBrandingDto(
    string Slug,
    string Name,
    string? LogoUrl);
