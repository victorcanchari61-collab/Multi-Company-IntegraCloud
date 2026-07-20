using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class CompanyBillingCredentialRepository(IamDbContext context)
    : BaseRepository<CompanyBillingCredential>(context), ICompanyBillingCredentialRepository
{
    public async Task<CompanyBillingCredential?> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.CompanyBillingCredentials.FirstOrDefaultAsync(c => c.CompanyId == companyId, ct);
}
