using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class RolePermission : Entity
{
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; } = null!;
    public Guid PermissionId { get; private set; }
    public Permission Permission { get; private set; } = null!;

    private RolePermission() { }

    public RolePermission(Guid roleId, Guid permissionId) : base(Guid.NewGuid())
    {
        RoleId = roleId;
        PermissionId = permissionId;
    }
}
