using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class CustomerRepository(IamDbContext context)
    : BaseRepository<Customer>(context), ICustomerRepository
{
    public async Task<List<Customer>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Customer>()
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.BusinessName)
            .ToListAsync(ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Customer>()
            .AnyAsync(c => c.CompanyId == companyId && c.Code == code && (excludeId == null || c.Id != excludeId), ct);
}
