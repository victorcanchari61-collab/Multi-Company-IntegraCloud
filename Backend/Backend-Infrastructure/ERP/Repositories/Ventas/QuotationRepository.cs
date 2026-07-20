using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class QuotationRepository(IamDbContext context)
    : BaseRepository<Quotation>(context), IQuotationRepository
{
    public async Task<List<Quotation>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Quotation>()
            .Include(q => q.Customer)
            .Where(q => q.CompanyId == companyId)
            .OrderByDescending(q => q.IssueDate)
            .ToListAsync(ct);

    public async Task<Quotation?> GetWithItemsAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<Quotation>()
            .Include(q => q.Customer)
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id, ct);

    public async Task<string> GetNextQuotationNumberAsync(Guid companyId, CancellationToken ct = default)
    {
        var last = await Context.Set<Quotation>()
            .Where(q => q.CompanyId == companyId)
            .OrderByDescending(q => q.QuotationNumber)
            .Select(q => q.QuotationNumber)
            .FirstOrDefaultAsync(ct);

        if (last == null) return "COT-0001";
        var num = int.TryParse(last.Replace("COT-", ""), out var n) ? n + 1 : 1;
        return $"COT-{num:D4}";
    }
}
