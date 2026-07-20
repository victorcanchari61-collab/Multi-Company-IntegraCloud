using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Warehouse : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Type { get; private set; }
    public string? Location { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private Warehouse() { }

    public Warehouse(Guid id, Guid companyId, string code, string name, string? type, string? location) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        Name = name;
        Type = type;
        Location = location;
    }

    public void Update(string code, string name, string? type, string? location)
    {
        Code = code;
        Name = name;
        Type = type;
        Location = location;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
