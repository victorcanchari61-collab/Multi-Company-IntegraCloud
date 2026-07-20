using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class CommercialTermRepository(IamDbContext context)
    : BaseRepository<CommercialTerm>(context), ICommercialTermRepository
{
    public async Task<List<CommercialTerm>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<CommercialTerm>()
            .Where(ct => ct.CompanyId == companyId)
            .OrderBy(ct => ct.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<CommercialTerm>()
            .AnyAsync(ct => ct.CompanyId == companyId && ct.Code == code && (excludeId == null || ct.Id != excludeId), ct);
}
