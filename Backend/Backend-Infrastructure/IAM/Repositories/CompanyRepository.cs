using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class CompanyRepository(IamDbContext context)
    : BaseRepository<Company>(context), ICompanyRepository
{
    public async Task<Company?> GetByTaxIdAsync(string taxId, CancellationToken ct = default)
        => await Context.Companies.FirstOrDefaultAsync(c => c.TaxId == taxId, ct);

    public async Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await Context.Companies.FirstOrDefaultAsync(c => c.Slug == slug, ct);
}
