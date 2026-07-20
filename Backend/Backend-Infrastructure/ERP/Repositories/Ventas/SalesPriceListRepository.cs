using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class SalesPriceListRepository(IamDbContext context)
    : BaseRepository<SalesPriceList>(context), ISalesPriceListRepository
{
    public async Task<List<SalesPriceList>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<SalesPriceList>()
            .Where(pl => pl.CompanyId == companyId)
            .OrderBy(pl => pl.Name)
            .ToListAsync(ct);

    public async Task<SalesPriceList?> GetWithItemsAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<SalesPriceList>()
            .Include(pl => pl.Items)
            .FirstOrDefaultAsync(pl => pl.Id == id, ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<SalesPriceList>()
            .AnyAsync(pl => pl.CompanyId == companyId && pl.Code == code && (excludeId == null || pl.Id != excludeId), ct);
}
