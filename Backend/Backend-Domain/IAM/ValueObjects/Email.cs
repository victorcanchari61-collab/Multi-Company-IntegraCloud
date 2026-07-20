using Backend.SharedKernel;

namespace Backend.Domain.IAM.ValueObjects;

public sealed class Email : ValueObject
{
    public string Value { get; }

    public Email(string value)
    {
        Guard.AgainstNullOrWhiteSpace(value, nameof(value));
        Guard.AgainstInvalidEmail(value, nameof(value));
        Value = value.Trim().ToLowerInvariant();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public static implicit operator string(Email email) => email.Value;
}
