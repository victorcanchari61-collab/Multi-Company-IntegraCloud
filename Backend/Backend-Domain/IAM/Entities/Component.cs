using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Component : AggregateRoot
{
    public Guid ViewId { get; private set; }
    public View View { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;

    private Component() { }

    public Component(Guid id, Guid viewId, string code, string name)
        : base(id)
    {
        ViewId = viewId;
        Code = code;
        Name = name;
    }
}
