using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class RefreshTokenRepository(IamDbContext context)
    : BaseRepository<RefreshToken>(context), IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        => await Context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var activeTokens = await Context.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var token in activeTokens)
            token.Revoke();
    }
}
