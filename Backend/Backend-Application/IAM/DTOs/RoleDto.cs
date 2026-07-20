namespace Backend.Application.IAM.DTOs;

public sealed record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    string? RolSistema = null,
    Guid? ParentRoleId = null,
    string? ParentRoleName = null,
    int SortOrder = 0,
    IReadOnlyCollection<string>? Restrictions = null,
    List<RoleDto> Children = null!
);

public sealed record RoleTreeDto(
    Guid Id,
    string Name,
    string? Description,
    Guid? ParentRoleId,
    string? ParentRoleName,
    int SortOrder,
    List<RoleTreeDto> Children
);
