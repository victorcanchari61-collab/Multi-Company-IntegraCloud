namespace Backend.Application.IAM.DTOs;

public sealed record UserDto(
    Guid Id,
    string Email,
    string FullName,
    int Status,
    DateTime CreatedAt
);
