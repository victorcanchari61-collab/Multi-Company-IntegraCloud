namespace Backend.Application.IAM.DTOs;

public sealed record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    string? ReferenceType,
    string? ReferenceId,
    bool IsRead,
    DateTime CreatedAt,
    DateTime? ReadAt
);

public sealed record UnreadCountDto(int Count);
