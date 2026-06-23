using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Module : AggregateRoot
{
    public Guid SystemId { get; private set; }
    public SystemEntity System { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<View> Views { get; private set; } = [];
    public ICollection<Permission> Permissions { get; private set; } = [];
    public ICollection<CompanyModuleAccess> CompanyAccesses { get; private set; } = [];

    private Module() { }

    public Module(Guid id, Guid systemId, string code, string name) : base(id)
    {
        SystemId = systemId;
        Code = code;
        Name = name;
    }
}
