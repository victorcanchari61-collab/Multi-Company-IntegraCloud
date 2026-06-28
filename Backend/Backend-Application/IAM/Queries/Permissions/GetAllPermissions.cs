using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Permissions;

public sealed record GetAllPermissionsQuery : IRequest<Result<List<PermissionTreeDto>>>;

public sealed class GetAllPermissionsQueryHandler(IPermissionRepository permissionRepository)
    : IRequestHandler<GetAllPermissionsQuery, Result<List<PermissionTreeDto>>>
{
    public async Task<Result<List<PermissionTreeDto>>> Handle(GetAllPermissionsQuery request, CancellationToken ct)
    {
        var permissions = await permissionRepository.GetAllAsync(ct);
        var dtos = permissions
            .OrderBy(p => p.Key)
            .Select(p => new PermissionTreeDto(p.Id, p.Key, p.Description ?? p.Key))
            .ToList();

        return Result<List<PermissionTreeDto>>.Success(dtos);
    }
}
