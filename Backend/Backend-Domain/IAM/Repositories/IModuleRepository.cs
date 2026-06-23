using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface IModuleRepository : IRepository<Module>
{
    Task<List<Module>> GetBySystemIdAsync(Guid systemId, CancellationToken ct = default);
}
