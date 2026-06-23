namespace Backend.Application.IAM.DTOs;

public sealed record AuthTokensDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

public sealed record UserProfileDto(
    Guid Id,
    string Email,
    string FullName,
    Guid? CompanyId,
    bool IsOwner,
    IReadOnlyCollection<string> Roles
);

public sealed record CompanyDto(
    Guid Id,
    string Name,
    string Slug,
    string? LegalName,
    string? LogoUrl,
    string? Email,
    string? Phone,
    string? Website,
    string? Address,
    string? TaxId,
    string? TaxAddress,
    string? EconomicActivity,
    int TaxpayerType,
    bool AccountingRequired,
    string SettlementCurrency,
    int Status,
    DateTime CreatedAt
);

public sealed record UserDto(
    Guid Id,
    string Email,
    string FullName,
    int Status,
    DateTime CreatedAt
);

public sealed record RoleDto(
    Guid Id,
    string Name,
    string? Description
);

public sealed record ModuleDto(
    Guid Id,
    string Code,
    string Name
);

public sealed record PermissionTreeDto(
    Guid Id,
    string Key,
    string Description
);

public sealed record PagedResult<T>(
    IReadOnlyCollection<T> Items,
    int Total,
    int Page,
    int Size
);
