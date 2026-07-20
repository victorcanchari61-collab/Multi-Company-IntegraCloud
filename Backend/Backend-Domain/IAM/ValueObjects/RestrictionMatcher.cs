namespace Backend.Domain.IAM.ValueObjects;

/// <summary>Semántica del modelo blacklist. Debe mantenerse idéntica a la del frontend
/// (Muli-Company/src/features/auth/hooks/usePermissions.ts).
/// Una restricción bloquea su key exacta y todas las descendientes por prefijo:
/// "erp.compras" bloquea "erp.compras.ordenes-compra.emitir".</summary>
public static class RestrictionMatcher
{
    /// <summary>True si la key está bloqueada por alguna restricción (match exacto o por prefijo de segmentos).</summary>
    public static bool IsRestricted(string key, IEnumerable<string> restrictions)
        => restrictions.Any(r => key == r || key.StartsWith(r + ".", StringComparison.Ordinal));

    /// <summary>Los dos primeros segmentos de la key: "erp.compras.x.y" → "erp.compras".</summary>
    public static string ModuleOf(string key)
    {
        var second = key.IndexOf('.', key.IndexOf('.') + 1);
        return second < 0 ? key : key[..second];
    }

    /// <summary>True si el módulo de la key está licenciado. Una key de un solo segmento
    /// (sistema, p.ej. "erp") se considera licenciada si algún módulo del sistema lo está.</summary>
    public static bool IsLicensed(string key, IReadOnlySet<string> licensedModules)
    {
        var module = ModuleOf(key);
        if (licensedModules.Contains(module)) return true;
        return !key.Contains('.') && licensedModules.Any(m => m.StartsWith(key + ".", StringComparison.Ordinal));
    }
}
