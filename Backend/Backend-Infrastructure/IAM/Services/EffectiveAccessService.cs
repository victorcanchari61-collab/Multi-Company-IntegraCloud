using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;

namespace Backend.Infrastructure.IAM.Services;

internal sealed class EffectiveAccessService(
    IUserRepository userRepository,
    IUserRestrictionRepository userRestrictionRepository,
    IRoleRepository roleRepository)
    : IEffectiveAccessService
{
    public async Task<AccessProfile?> GetForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdWithRolesAsync(userId, ct);
        if (user is null) return null;

        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

        var directKeys = (await userRestrictionRepository.GetByUserIdAsync(userId, ct))
            .Select(r => r.RestrictedKey);

        var roleKeys = roleIds.Count > 0
            ? await roleRepository.GetRestrictionKeysByRoleIdsAsync(roleIds, ct)
            : [];

        var restrictions = directKeys
            .Concat(roleKeys)
            .Distinct()
            .ToList();

        return new AccessProfile([], restrictions);
    }

    public Task InvalidateUserAsync(Guid userId) => Task.CompletedTask;

    public Task InvalidateUsersAsync(IEnumerable<Guid> userIds) => Task.CompletedTask;
}
