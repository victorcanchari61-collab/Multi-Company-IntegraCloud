using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using MediatR;

namespace Backend.Application.IAM.Queries.Roles;

public sealed record GetRoleTreeByCompanyQuery(Guid CompanyId) : IRequest<List<RoleTreeDto>>;

internal sealed class GetRoleTreeByCompanyHandler(IRoleRepository repo)
    : IRequestHandler<GetRoleTreeByCompanyQuery, List<RoleTreeDto>>
{
    public async Task<List<RoleTreeDto>> Handle(GetRoleTreeByCompanyQuery query, CancellationToken ct)
    {
        var roles = await repo.GetByCompanyIdWithHierarchyAsync(query.CompanyId, ct);
        return BuildTree(roles.Where(r => r.ParentRoleId == null).OrderBy(r => r.SortOrder), roles.ToDictionary(r => r.Id)).ToList();
    }

    private static IEnumerable<RoleTreeDto> BuildTree(IEnumerable<Domain.IAM.Entities.Role> roots,
        Dictionary<Guid, Domain.IAM.Entities.Role> all)
    {
        foreach (var role in roots)
        {
            yield return new RoleTreeDto(
                role.Id, role.Name, role.Description,
                role.ParentRoleId, role.ParentRole?.Name,
                role.SortOrder,
                BuildTree(role.ChildRoles.OrderBy(r => r.SortOrder), all).ToList());
        }
    }
}
