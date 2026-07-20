using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class PriceListRepository(IamDbContext context)
    : BaseRepository<PriceList>(context), IPriceListRepository
{
    public async Task<List<PriceList>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<PriceList>()
            .Where(p => p.CompanyId == companyId)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);
}
