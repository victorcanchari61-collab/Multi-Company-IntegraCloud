using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class AuthorizationConfig : Entity
{
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; } = null!;
    public string Module { get; private set; } = null!;
    public string Action { get; private set; } = null!;
    public string TipoAutorizador { get; private set; } = "usuario";
    public Guid? AutorizadorId { get; private set; }
    public string? CargoAutorizador { get; private set; }
    public Guid? RoleAutorizadorId { get; private set; }
    public bool RequiereAutorizacion { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private AuthorizationConfig() { }

    public AuthorizationConfig(
        Guid roleId, string module, string action,
        string tipoAutorizador = "usuario", Guid? autorizadorId = null,
        string? cargoAutorizador = null, Guid? roleAutorizadorId = null)
        : base(Guid.NewGuid())
    {
        RoleId = roleId;
        Module = module;
        Action = action;
        TipoAutorizador = tipoAutorizador;
        AutorizadorId = autorizadorId;
        CargoAutorizador = cargoAutorizador;
        RoleAutorizadorId = roleAutorizadorId;
    }
}
