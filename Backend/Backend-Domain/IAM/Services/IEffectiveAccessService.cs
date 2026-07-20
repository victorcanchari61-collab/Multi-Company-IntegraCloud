namespace Backend.Domain.IAM.Services;

/// <summary>Módulos licenciados ("erp.compras") y keys restringidas del usuario.
/// Owner: todos los módulos activos y sin restricciones.</summary>
public sealed record AccessProfile(IReadOnlyList<string> LicensedModules, IReadOnlyList<string> Restrictions);

/// <summary>Acceso efectivo (modelo blacklist) con caché. Fail-closed: en miss
/// se computa desde BD; nunca se permite por ausencia de caché.</summary>
public interface IEffectiveAccessService
{
    Task<AccessProfile?> GetForUserAsync(Guid userId, CancellationToken ct = default);
    Task InvalidateUserAsync(Guid userId);
    Task InvalidateUsersAsync(IEnumerable<Guid> userIds);
}
