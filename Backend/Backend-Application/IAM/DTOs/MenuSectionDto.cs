namespace Backend.Application.IAM.DTOs;

public sealed record MenuSectionDto(
    string SystemCode,
    string SystemName,
    List<MenuItemDto> Items);

public sealed record MenuItemDto(
    string Code,
    string Label,
    string Route);
