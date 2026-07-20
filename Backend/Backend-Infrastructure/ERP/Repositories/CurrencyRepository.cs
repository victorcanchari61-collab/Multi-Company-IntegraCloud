using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class CurrencyRepository(IamDbContext context)
    : BaseRepository<Currency>(context), ICurrencyRepository
{
    public async Task<List<Currency>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Currency>()
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.Code)
            .ToListAsync(ct);
}
