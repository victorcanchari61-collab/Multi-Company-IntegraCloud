using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(Guid? companyId, string email, CancellationToken ct = default);
    Task<List<User>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<User?> GetByIdWithRolesAsync(Guid userId, CancellationToken ct = default);
}
