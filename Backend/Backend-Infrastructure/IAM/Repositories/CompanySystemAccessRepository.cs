using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class CompanySystemAccessRepository(IamDbContext context)
    : BaseRepository<CompanySystemAccess>(context), ICompanySystemAccessRepository
{
    public async Task<List<CompanySystemAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.CompanySystemAccesses.Where(c => c.CompanyId == companyId).ToListAsync(ct);

    public async Task<bool> HasAccessAsync(Guid companyId, Guid systemId, CancellationToken ct = default)
        => await Context.CompanySystemAccesses.AnyAsync(c => c.CompanyId == companyId && c.SystemId == systemId, ct);

    public async Task<CompanySystemAccess?> GetByCompanyAndSystemAsync(Guid companyId, Guid systemId, CancellationToken ct = default)
        => await Context.CompanySystemAccesses.FirstOrDefaultAsync(c => c.CompanyId == companyId && c.SystemId == systemId, ct);
}
