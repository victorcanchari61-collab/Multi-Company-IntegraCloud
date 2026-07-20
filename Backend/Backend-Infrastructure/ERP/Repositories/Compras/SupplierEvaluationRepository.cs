using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Compras;

internal sealed class SupplierEvaluationRepository(IamDbContext context)
    : BaseRepository<SupplierEvaluation>(context), ISupplierEvaluationRepository
{
    public async Task<List<SupplierEvaluation>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<SupplierEvaluation>()
            .Include(e => e.Supplier)
            .Where(e => e.CompanyId == companyId)
            .OrderByDescending(e => e.EvaluationDate)
            .ToListAsync(ct);

    public async Task<List<SupplierEvaluation>> GetBySupplierAsync(Guid supplierId, CancellationToken ct = default)
        => await Context.Set<SupplierEvaluation>()
            .Include(e => e.Supplier)
            .Where(e => e.SupplierId == supplierId)
            .OrderByDescending(e => e.EvaluationDate)
            .ToListAsync(ct);
}
