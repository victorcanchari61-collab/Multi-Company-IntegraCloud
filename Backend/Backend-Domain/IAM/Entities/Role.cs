using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Role : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsSystemTemplate { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<RolePermission> RolePermissions { get; private set; } = [];
    public ICollection<UserRole> UserRoles { get; private set; } = [];

    private Role() { }

    public Role(Guid id, Guid companyId, string name, string? description, bool isSystemTemplate = false)
        : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Description = description;
        IsSystemTemplate = isSystemTemplate;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }
}
