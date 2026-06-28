namespace Backend.Application.IAM.DTOs;

/// <summary>Sección del menú = un sistema (IAM, ERP…) con sus módulos.</summary>
public sealed record MenuSectionDto(
    string SystemCode,
    string SystemName,
    List<MenuModuleDto> Modules);

/// <summary>
/// Módulo dentro de un sistema. Puede ser:
///  - hoja (Route con valor, Submodules vacío) → link directo, ej. IAM → Usuarios.
///  - grupo (Submodules con valor) → se despliega en submódulos, ej. ERP → Productos.
/// </summary>
public sealed record MenuModuleDto(
    string Code,
    string Label,
    string? Route,
    List<MenuItemDto> Submodules);

/// <summary>Submódulo (View) = pantalla navegable dentro de un módulo.</summary>
public sealed record MenuItemDto(
    string Code,
    string Label,
    string Route);
