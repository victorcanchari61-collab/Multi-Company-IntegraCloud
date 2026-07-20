using Backend.SharedKernel;

namespace Backend.Domain.IAM.ValueObjects;

public sealed class PermissionKey : ValueObject
{
    public string Value { get; }

    public PermissionKey(string value)
    {
        Guard.AgainstNullOrWhiteSpace(value, nameof(value));
        Value = value.Trim().ToLowerInvariant();
    }

    public string System => Value.Split('.')[0];
    public string? Module => Value.Contains('.') ? Value.Split('.')[1] : null;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(PermissionKey key) => key.Value;
}
