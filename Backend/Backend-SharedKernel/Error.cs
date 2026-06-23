namespace Backend.SharedKernel;

public readonly record struct Error
{
    public string Code { get; }
    public string Message { get; }
    public ErrorType Type { get; }

    private Error(string code, string message, ErrorType type)
    {
        Code = code;
        Message = message;
        Type = type;
    }

    public static Error NotFound(string code, string message)
        => new(code, message, ErrorType.NotFound);

    public static Error Validation(string code, string message)
        => new(code, message, ErrorType.Validation);

    public static Error Conflict(string code, string message)
        => new(code, message, ErrorType.Conflict);

    public static Error Unauthorized(string code, string message)
        => new(code, message, ErrorType.Unauthorized);

    public static Error Forbidden(string code, string message)
        => new(code, message, ErrorType.Forbidden);

    public static Error Internal(string code = "internal.error", string message = "An internal error occurred")
        => new(code, message, ErrorType.Internal);
}

public enum ErrorType
{
    NotFound,
    Validation,
    Conflict,
    Unauthorized,
    Forbidden,
    Internal,
}
