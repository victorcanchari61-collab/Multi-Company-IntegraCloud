using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Compras;

internal sealed class PurchaseContractRepository(IamDbContext context)
    : BaseRepository<PurchaseContract>(context), IPurchaseContractRepository
{
    public async Task<List<PurchaseContract>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<PurchaseContract>()
            .Include(c => c.Supplier)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(ct);

    public async Task<List<PurchaseContract>> GetBySupplierAsync(Guid supplierId, CancellationToken ct = default)
        => await Context.Set<PurchaseContract>()
            .Include(c => c.Supplier)
            .Where(c => c.SupplierId == supplierId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(ct);
}
