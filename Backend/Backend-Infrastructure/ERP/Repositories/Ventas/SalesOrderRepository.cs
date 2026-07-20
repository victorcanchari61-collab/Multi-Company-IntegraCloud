using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class SalesOrderRepository(IamDbContext context)
    : BaseRepository<SalesOrder>(context), ISalesOrderRepository
{
    public async Task<List<SalesOrder>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<SalesOrder>()
            .Include(so => so.Customer)
            .Where(so => so.CompanyId == companyId)
            .OrderByDescending(so => so.IssueDate)
            .ToListAsync(ct);

    public async Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<SalesOrder>()
            .Include(so => so.Customer)
            .Include(so => so.Items)
            .FirstOrDefaultAsync(so => so.Id == id, ct);

    public async Task<string> GetNextOrderNumberAsync(Guid companyId, CancellationToken ct = default)
    {
        var last = await Context.Set<SalesOrder>()
            .Where(so => so.CompanyId == companyId)
            .OrderByDescending(so => so.OrderNumber)
            .Select(so => so.OrderNumber)
            .FirstOrDefaultAsync(ct);

        if (last == null) return "OV-0001";
        var num = int.TryParse(last.Replace("OV-", ""), out var n) ? n + 1 : 1;
        return $"OV-{num:D4}";
    }
}
