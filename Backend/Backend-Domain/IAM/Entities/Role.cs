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

    /// <summary>Reemplaza el conjunto de permisos del rol (agrega los nuevos, quita los que ya no están).
    /// Requiere que RolePermissions esté cargada.</summary>
    public void SetPermissions(IEnumerable<Guid> permissionIds)
    {
        var target = permissionIds.Distinct().ToHashSet();

        foreach (var rp in RolePermissions.Where(rp => !target.Contains(rp.PermissionId)).ToList())
            RolePermissions.Remove(rp);

        foreach (var permissionId in target.Where(id => RolePermissions.All(rp => rp.PermissionId != id)))
            RolePermissions.Add(new RolePermission(Id, permissionId));
    }
}
