using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class PermissionAction : AggregateRoot
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;

    public ICollection<Permission> Permissions { get; private set; } = [];

    private PermissionAction() { }

    public PermissionAction(Guid id, string code, string name)
        : base(id)
    {
        Code = code;
        Name = name;
    }
}
