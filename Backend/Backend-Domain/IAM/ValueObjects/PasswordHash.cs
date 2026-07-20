using Backend.SharedKernel;

namespace Backend.Domain.IAM.ValueObjects;

public sealed class PasswordHash : ValueObject
{
    public string Value { get; }

    public PasswordHash(string value)
    {
        Guard.AgainstNullOrWhiteSpace(value, nameof(value));
        Value = value;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(PasswordHash passwordHash) => passwordHash.Value;
}
