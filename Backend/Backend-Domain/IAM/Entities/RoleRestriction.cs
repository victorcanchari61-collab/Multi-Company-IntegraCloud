using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

/// <summary>Restricción (blacklist) de un rol: la key bloqueada y sus descendientes por prefijo.
/// Effect 'deny' oculta; fases futuras añaden otros efectos (p.ej. 'require-auth').</summary>
public sealed class RoleRestriction : Entity
{
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; } = null!;
    public string RestrictedKey { get; private set; } = null!;
    public string Effect { get; private set; } = "deny";
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private RoleRestriction() { }

    public RoleRestriction(Guid roleId, string restrictedKey) : base(Guid.NewGuid())
    {
        RoleId = roleId;
        RestrictedKey = restrictedKey;
    }
}
