namespace Backend.Application.IAM.DTOs;

public sealed record PagedResult<T>(
    IReadOnlyCollection<T> Items,
    int Total,
    int Page,
    int Size
);
