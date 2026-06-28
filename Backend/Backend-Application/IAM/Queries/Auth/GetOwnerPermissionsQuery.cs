using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Auth;

public sealed record GetOwnerPermissionsQuery : IRequest<Result<List<string>>>;

public sealed class GetOwnerPermissionsQueryHandler(
    IPermissionRepository permissionRepository)
    : IRequestHandler<GetOwnerPermissionsQuery, Result<List<string>>>
{
    public async Task<Result<List<string>>> Handle(GetOwnerPermissionsQuery request, CancellationToken ct)
    {
        var allPermissions = await permissionRepository.GetAllAsync(ct);
        return Result<List<string>>.Success(allPermissions.Select(p => p.Key).ToList());
    }
}
