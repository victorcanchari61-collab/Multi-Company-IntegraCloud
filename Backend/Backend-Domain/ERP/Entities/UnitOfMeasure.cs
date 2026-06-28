using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

/// <summary>Unidad de medida (catálogo Core, por empresa). Ej: UND, KG, LT, MT.</summary>
public sealed class UnitOfMeasure : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; } = null!;
    public string Abbreviation { get; private set; } = null!;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private UnitOfMeasure() { }

    public UnitOfMeasure(Guid id, Guid companyId, string name, string abbreviation) : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Abbreviation = abbreviation;
    }

    public void Update(string name, string abbreviation)
    {
        Name = name;
        Abbreviation = abbreviation;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
