using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Compras;

internal sealed class PurchaseOrderRepository(IamDbContext context)
    : BaseRepository<PurchaseOrder>(context), IPurchaseOrderRepository
{
    public async Task<List<PurchaseOrder>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<PurchaseOrder>()
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .Where(po => po.CompanyId == companyId)
            .OrderByDescending(po => po.IssueDate)
            .ToListAsync(ct);

    public async Task<PurchaseOrder?> GetWithItemsAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<PurchaseOrder>()
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == id, ct);

    public async Task<string> GetNextOrderNumberAsync(Guid companyId, CancellationToken ct = default)
    {
        var last = await Context.Set<PurchaseOrder>()
            .Where(po => po.CompanyId == companyId)
            .OrderByDescending(po => po.OrderNumber)
            .Select(po => po.OrderNumber)
            .FirstOrDefaultAsync(ct);

        if (last == null) return "OC-0001";
        var num = int.TryParse(last.Replace("OC-", ""), out var n) ? n + 1 : 1;
        return $"OC-{num:D4}";
    }
}
