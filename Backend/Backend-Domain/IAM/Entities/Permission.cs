using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Permission : AggregateRoot
{
    public string Key { get; private set; } = null!;
    public int ResourceType { get; private set; } // 1=System, 2=Module, 3=View, 4=Component
    public Guid ResourceId { get; private set; }
    public Guid ModuleId { get; private set; }
    public Module Module { get; private set; } = null!;
    public string ActionCode { get; private set; } = null!;
    public PermissionAction Action { get; private set; } = null!;
    public string? Description { get; private set; }

    public ICollection<RolePermission> RolePermissions { get; private set; } = [];

    private Permission() { }

    public Permission(Guid id, string key, int resourceType, Guid resourceId,
        Guid moduleId, string actionCode, string? description)
        : base(id)
    {
        Key = key;
        ResourceType = resourceType;
        ResourceId = resourceId;
        ModuleId = moduleId;
        ActionCode = actionCode;
        Description = description;
    }
}
