using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class View : AggregateRoot
{
    public Guid ModuleId { get; private set; }
    public Module Module { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Route { get; private set; }

    public ICollection<Component> Components { get; private set; } = [];

    private View() { }

    public View(Guid id, Guid moduleId, string code, string name, string? route)
        : base(id)
    {
        ModuleId = moduleId;
        Code = code;
        Name = name;
        Route = route;
    }
}
