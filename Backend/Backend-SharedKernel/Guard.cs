namespace Backend.SharedKernel;

public static class Guard
{
    public static void AgainstNullOrWhiteSpace(string? value, string paramName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"'{paramName}' cannot be null or whitespace.", paramName);
    }

    public static void AgainstNull(object? value, string paramName)
    {
        if (value is null)
            throw new ArgumentNullException(paramName);
    }

    public static void AgainstOutOfRange<T>(T value, T min, T max, string paramName) where T : IComparable<T>
    {
        if (value.CompareTo(min) < 0 || value.CompareTo(max) > 0)
            throw new ArgumentOutOfRangeException(paramName, $"'{paramName}' must be between {min} and {max}.");
    }

    public static void AgainstInvalidEmail(string? email, string paramName)
    {
        AgainstNullOrWhiteSpace(email, paramName);
        if (!email!.Contains('@'))
            throw new ArgumentException($"'{paramName}' is not a valid email.", paramName);
    }
}
