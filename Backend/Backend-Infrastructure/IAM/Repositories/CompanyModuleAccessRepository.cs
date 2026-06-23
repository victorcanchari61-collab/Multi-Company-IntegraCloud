using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class CompanyModuleAccessRepository(IamDbContext context)
    : BaseRepository<CompanyModuleAccess>(context), ICompanyModuleAccessRepository
{
    public async Task<List<CompanyModuleAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.CompanyModuleAccesses.Where(c => c.CompanyId == companyId).ToListAsync(ct);

    public async Task<bool> HasAccessAsync(Guid companyId, Guid moduleId, CancellationToken ct = default)
        => await Context.CompanyModuleAccesses.AnyAsync(c => c.CompanyId == companyId && c.ModuleId == moduleId, ct);
}
