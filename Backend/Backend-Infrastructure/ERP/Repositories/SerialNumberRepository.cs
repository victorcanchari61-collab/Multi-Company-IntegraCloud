using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class SerialNumberRepository(IamDbContext context)
    : BaseRepository<SerialNumber>(context), ISerialNumberRepository
{
    public async Task<List<SerialNumber>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
        => await Context.Set<SerialNumber>()
            .Include(s => s.Batch)
            .Include(s => s.Warehouse)
            .Where(s => s.CompanyId == companyId && s.ProductId == productId)
            .OrderBy(s => s.Serial)
            .ToListAsync(ct);

    public async Task<List<SerialNumber>> GetByBatchAsync(Guid batchId, CancellationToken ct = default)
        => await Context.Set<SerialNumber>()
            .Include(s => s.Warehouse)
            .Where(s => s.BatchId == batchId)
            .OrderBy(s => s.Serial)
            .ToListAsync(ct);

    public async Task<SerialNumber?> GetBySerialAsync(Guid companyId, string serial, CancellationToken ct = default)
        => await Context.Set<SerialNumber>()
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .FirstOrDefaultAsync(s => s.CompanyId == companyId && s.Serial == serial, ct);

    public async Task<List<SerialNumber>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<SerialNumber>()
            .Include(s => s.Product)
            .Include(s => s.Batch)
            .Where(s => s.CompanyId == companyId && s.WarehouseId == warehouseId)
            .OrderBy(s => s.Serial)
            .ToListAsync(ct);
}
