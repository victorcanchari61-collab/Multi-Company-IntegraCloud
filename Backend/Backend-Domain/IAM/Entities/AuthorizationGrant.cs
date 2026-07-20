using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class AuthorizationGrant : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public string Module { get; private set; } = null!;
    public string Action { get; private set; } = null!;
    public string Tipo { get; private set; } = "permanente";
    public bool Activa { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; private set; }

    private AuthorizationGrant() { }

    public AuthorizationGrant(Guid userId, string module, string action,
        string tipo = "permanente", DateTime? expiresAt = null)
        : base(Guid.NewGuid())
    {
        UserId = userId;
        Module = module;
        Action = action;
        Tipo = tipo;
        ExpiresAt = expiresAt;
    }

    public void Deactivate() => Activa = false;
}
