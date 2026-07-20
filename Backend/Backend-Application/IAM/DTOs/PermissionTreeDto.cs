namespace Backend.Application.IAM.DTOs;

public sealed record PermissionTreeDto(
    Guid Id,
    string Key,
    string Description
);
