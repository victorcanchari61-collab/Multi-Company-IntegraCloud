namespace Backend.Application.IAM.DTOs;

public sealed record ModuleDto(
    Guid Id,
    string Code,
    string Name
);
