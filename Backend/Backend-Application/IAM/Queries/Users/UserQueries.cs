using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Users;

public sealed record GetUsersByCompanyQuery(
    Guid CompanyId,
    int Page = 1,
    int Size = 20,
    string? Search = null) : IRequest<Result<PagedResult<UserDto>>>;

public sealed class GetUsersByCompanyQueryHandler(IUserRepository userRepository)
    : IRequestHandler<GetUsersByCompanyQuery, Result<PagedResult<UserDto>>>
{
    public async Task<Result<PagedResult<UserDto>>> Handle(GetUsersByCompanyQuery request, CancellationToken ct)
    {
        var all = await userRepository.GetByCompanyIdAsync(request.CompanyId, ct);

        var filtered = request.Search is not null
            ? all.Where(u => u.FullName.Contains(request.Search, StringComparison.OrdinalIgnoreCase)
                           || u.Email.Contains(request.Search, StringComparison.OrdinalIgnoreCase)).ToList()
            : all;

        var paged = filtered
            .Skip((request.Page - 1) * request.Size)
            .Take(request.Size)
            .Select(u => new UserDto(u.Id, u.Email, u.FullName, u.Status, u.CreatedAt))
            .ToList();

        return Result<PagedResult<UserDto>>.Success(
            new PagedResult<UserDto>(paged, filtered.Count, request.Page, request.Size));
    }
}

public sealed record GetRolesByCompanyQuery(Guid CompanyId) : IRequest<Result<List<RoleDto>>>;

public sealed class GetRolesByCompanyQueryHandler(IRoleRepository roleRepository)
    : IRequestHandler<GetRolesByCompanyQuery, Result<List<RoleDto>>>
{
    public async Task<Result<List<RoleDto>>> Handle(GetRolesByCompanyQuery request, CancellationToken ct)
    {
        var roles = await roleRepository.GetByCompanyIdAsync(request.CompanyId, ct);
        var dtos = roles.Select(r => new RoleDto(r.Id, r.Name, r.Description)).ToList();
        return Result<List<RoleDto>>.Success(dtos);
    }
}
