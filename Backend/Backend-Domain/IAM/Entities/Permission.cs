using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Permission : AggregateRoot
{
    public string Key { get; private set; } = null!;
    public Guid ModuleId { get; private set; }
    public Module Module { get; private set; } = null!;
    public string ActionCode { get; private set; } = null!;
    public PermissionAction Action { get; private set; } = null!;
    public string? Description { get; private set; }

    public ICollection<RolePermission> RolePermissions { get; private set; } = [];

    private Permission() { }

    public Permission(Guid id, string key,
        Guid moduleId, string actionCode, string? description)
        : base(id)
    {
        Key = key;
        ModuleId = moduleId;
        ActionCode = actionCode;
        Description = description;
    }
}
