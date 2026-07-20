using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public sealed class CommercialTerm : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public int PaymentDays { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private CommercialTerm() { }

    public CommercialTerm(Guid id, Guid companyId, string code, string name,
        string? description = null, int paymentDays = 0) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        Name = name;
        Description = description;
        PaymentDays = paymentDays;
    }

    public void Update(string code, string name, string? description, int paymentDays)
    {
        Code = code;
        Name = name;
        Description = description;
        PaymentDays = paymentDays;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
