namespace Backend.Application.IAM.DTOs;

/// <summary>Perfil de acceso del usuario para el modelo blacklist:
/// módulos licenciados ("erp.compras") y keys restringidas.</summary>
public sealed record MyAccessDto(List<string> LicensedModules, List<string> Restrictions);
