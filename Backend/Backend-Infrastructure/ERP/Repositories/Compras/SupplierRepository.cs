using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Compras;

internal sealed class SupplierRepository(IamDbContext context)
    : BaseRepository<Supplier>(context), ISupplierRepository
{
    public async Task<List<Supplier>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Supplier>()
            .Where(s => s.CompanyId == companyId)
            .OrderBy(s => s.BusinessName)
            .ToListAsync(ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Supplier>()
            .AnyAsync(s => s.CompanyId == companyId && s.Code == code && (excludeId == null || s.Id != excludeId), ct);
}
