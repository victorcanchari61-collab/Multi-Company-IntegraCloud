using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Currency : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!; // PEN, USD, EUR
    public string Name { get; private set; } = null!;
    public string? Symbol { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Currency() { }

    public Currency(Guid id, Guid companyId, string code, string name, string? symbol) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        Name = name;
        Symbol = symbol;
    }

    public void Update(string code, string name, string? symbol)
    {
        Code = code;
        Name = name;
        Symbol = symbol;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
