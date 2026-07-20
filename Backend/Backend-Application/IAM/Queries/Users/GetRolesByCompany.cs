using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Users;

public sealed record GetRolesByCompanyQuery(Guid CompanyId) : IRequest<Result<List<RoleDto>>>;

public sealed class GetRolesByCompanyQueryHandler(IRoleRepository roleRepository)
    : IRequestHandler<GetRolesByCompanyQuery, Result<List<RoleDto>>>
{
    public async Task<Result<List<RoleDto>>> Handle(GetRolesByCompanyQuery request, CancellationToken ct)
    {
        var roles = await roleRepository.GetByCompanyIdWithRestrictionsAsync(request.CompanyId, ct);

        var dtos = roles.Select(r => new RoleDto(
            r.Id,
            r.Name,
            r.Description,
            r.RolSistema,
            null, null, 0,
            r.Restrictions.Select(rr => rr.RestrictedKey).ToList()
        )).ToList();

        return Result<List<RoleDto>>.Success(dtos);
    }
}
