namespace Backend.Application.IAM.DTOs;

public sealed record UserProfileDto(
    Guid Id,
    string Email,
    string FullName,
    Guid? CompanyId,
    bool IsOwner,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> AllRestrictions,
    string? RolSistema = null,
    IReadOnlyCollection<string>? AuthGrants = null,
    string? RoleName = null
);
