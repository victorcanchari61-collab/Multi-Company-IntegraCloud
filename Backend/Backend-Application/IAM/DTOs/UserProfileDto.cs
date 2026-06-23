namespace Backend.Application.IAM.DTOs;

public sealed record UserProfileDto(
    Guid Id,
    string Email,
    string FullName,
    Guid? CompanyId,
    bool IsOwner,
    IReadOnlyCollection<string> Roles
);
