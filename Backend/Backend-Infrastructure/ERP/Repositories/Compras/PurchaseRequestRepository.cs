using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Compras;

internal sealed class PurchaseRequestRepository(IamDbContext context)
    : BaseRepository<PurchaseRequest>(context), IPurchaseRequestRepository
{
    public async Task<List<PurchaseRequest>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<PurchaseRequest>()
            .Include(pr => pr.Supplier)
            .Include(pr => pr.Items)
            .Where(pr => pr.CompanyId == companyId)
            .OrderByDescending(pr => pr.RequestDate)
            .ToListAsync(ct);

    public async Task<PurchaseRequest?> GetWithSupplierAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<PurchaseRequest>()
            .Include(pr => pr.Supplier)
            .FirstOrDefaultAsync(pr => pr.Id == id, ct);

    public async Task<string> GetNextRequestNumberAsync(Guid companyId, CancellationToken ct = default)
    {
        var last = await Context.Set<PurchaseRequest>()
            .Where(pr => pr.CompanyId == companyId)
            .OrderByDescending(pr => pr.RequestNumber)
            .Select(pr => pr.RequestNumber)
            .FirstOrDefaultAsync(ct);

        if (last == null) return "SC-0001";
        var num = int.TryParse(last.Replace("SC-", ""), out var n) ? n + 1 : 1;
        return $"SC-{num:D4}";
    }
}
