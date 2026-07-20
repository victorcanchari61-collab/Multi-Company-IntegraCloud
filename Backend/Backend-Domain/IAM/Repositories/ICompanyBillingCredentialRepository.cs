using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ICompanyBillingCredentialRepository : IRepository<CompanyBillingCredential>
{
    Task<CompanyBillingCredential?> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
}
