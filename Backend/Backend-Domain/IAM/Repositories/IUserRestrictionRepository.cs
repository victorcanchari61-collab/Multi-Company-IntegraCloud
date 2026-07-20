using Backend.Domain.IAM.Entities;

namespace Backend.Domain.IAM.Repositories;

public interface IUserRestrictionRepository
{
    Task<List<UserRestriction>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(UserRestriction restriction, CancellationToken ct = default);
    void Delete(UserRestriction restriction);
}
