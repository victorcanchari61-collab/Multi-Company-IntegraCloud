using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class UserRestrictionRepository(IamDbContext context) : IUserRestrictionRepository
{
    public async Task<List<UserRestriction>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await context.UserRestrictions
            .Where(r => r.UserId == userId)
            .ToListAsync(ct);

    public async Task AddAsync(UserRestriction restriction, CancellationToken ct = default)
        => await context.UserRestrictions.AddAsync(restriction, ct);

    public void Delete(UserRestriction restriction)
        => context.UserRestrictions.Remove(restriction);
}
