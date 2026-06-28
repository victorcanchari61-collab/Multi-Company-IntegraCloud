using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class UserRepository(IamDbContext context)
    : BaseRepository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(Guid? companyId, string email, CancellationToken ct = default)
        => await Context.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Email == email, ct);

    public async Task<List<User>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Users.Where(u => u.CompanyId == companyId).ToListAsync(ct);

    public async Task<User?> GetByIdWithRolesAsync(Guid userId, CancellationToken ct = default)
        => await Context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);
}
