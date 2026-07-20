using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Role : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public string? RolSistema { get; private set; }
    public bool IsSystemTemplate { get; private set; }
    public Guid? ParentRoleId { get; private set; }
    public Role? ParentRole { get; private set; }
    public ICollection<Role> ChildRoles { get; private set; } = [];
    public int SortOrder { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<RolePermission> RolePermissions { get; private set; } = [];
    public ICollection<UserRole> UserRoles { get; private set; } = [];
    public ICollection<RoleRestriction> Restrictions { get; private set; } = [];

    private Role() { }

    public Role(Guid id, Guid companyId, string name, string? description,
        string? rolSistema = null, bool isSystemTemplate = false,
        Guid? parentRoleId = null, int sortOrder = 0)
        : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Description = description;
        RolSistema = rolSistema;
        IsSystemTemplate = isSystemTemplate;
        ParentRoleId = parentRoleId;
        SortOrder = sortOrder;
    }

    public void Update(string name, string? description, string? rolSistema = null,
        Guid? parentRoleId = null, int sortOrder = 0)
    {
        Name = name;
        Description = description;
        RolSistema = rolSistema ?? RolSistema;
        ParentRoleId = parentRoleId;
        SortOrder = sortOrder;
    }

    public void SetPermissions(IEnumerable<Guid> permissionIds)
    {
        var target = permissionIds.Distinct().ToHashSet();
        foreach (var rp in RolePermissions.Where(rp => !target.Contains(rp.PermissionId)).ToList())
            RolePermissions.Remove(rp);
        foreach (var permissionId in target.Where(id => RolePermissions.All(rp => rp.PermissionId != id)))
            RolePermissions.Add(new RolePermission(Id, permissionId));
    }

    public void Restrict(string key)
    {
        if (Restrictions.All(r => r.RestrictedKey != key))
            Restrictions.Add(new RoleRestriction(Id, key));
    }

    public void Unrestrict(string key)
    {
        foreach (var restriction in Restrictions.Where(r => r.RestrictedKey == key).ToList())
            Restrictions.Remove(restriction);
    }
}
