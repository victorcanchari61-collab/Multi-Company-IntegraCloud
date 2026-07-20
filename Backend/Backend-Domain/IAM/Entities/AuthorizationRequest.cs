using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class AuthorizationRequest : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public string Module { get; private set; } = null!;
    public string Action { get; private set; } = null!;
    public string Estado { get; private set; } = "pendiente";
    public Guid? AutorizadorId { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    private AuthorizationRequest() { }

    public AuthorizationRequest(Guid userId, string module, string action)
        : base(Guid.NewGuid())
    {
        UserId = userId;
        Module = module;
        Action = action;
    }

    public void Approve(Guid autorizadorId)
    {
        Estado = "aprobada";
        AutorizadorId = autorizadorId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid autorizadorId)
    {
        Estado = "rechazada";
        AutorizadorId = autorizadorId;
        UpdatedAt = DateTime.UtcNow;
    }
}
