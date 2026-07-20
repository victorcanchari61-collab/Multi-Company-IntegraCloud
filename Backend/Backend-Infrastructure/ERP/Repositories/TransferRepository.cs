using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class TransferRepository(IamDbContext context)
    : BaseRepository<Transfer>(context), ITransferRepository
{
    public async Task<List<Transfer>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Transfer>()
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Where(t => t.CompanyId == companyId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<Transfer>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<Transfer>()
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Where(t => t.CompanyId == companyId && (t.FromWarehouseId == warehouseId || t.ToWarehouseId == warehouseId))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

    public async Task<Transfer?> GetWithItemsAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<Transfer>()
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
}
