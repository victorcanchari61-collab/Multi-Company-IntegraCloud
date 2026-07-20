using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class SystemEntity : AggregateRoot
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<Module> Modules { get; private set; } = [];

    private SystemEntity() { }

    public SystemEntity(Guid id, string code, string name, string? description)
        : base(id)
    {
        Code = code;
        Name = name;
        Description = description;
    }
}
