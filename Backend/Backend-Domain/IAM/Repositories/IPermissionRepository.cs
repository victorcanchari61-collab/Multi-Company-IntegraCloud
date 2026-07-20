using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface IPermissionRepository : IRepository<Permission>
{
    Task<List<Permission>> GetByModuleIdAsync(Guid moduleId, CancellationToken ct = default);
}
