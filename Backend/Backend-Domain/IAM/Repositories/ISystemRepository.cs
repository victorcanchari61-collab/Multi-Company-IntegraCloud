using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ISystemRepository : IRepository<SystemEntity>
{
    Task<SystemEntity?> GetByCodeAsync(string code, CancellationToken ct = default);
}
