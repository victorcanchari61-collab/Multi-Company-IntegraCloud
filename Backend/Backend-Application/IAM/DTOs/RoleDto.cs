namespace Backend.Application.IAM.DTOs;

public sealed record RoleDto(
    Guid Id,
    string Name,
    string? Description
);
