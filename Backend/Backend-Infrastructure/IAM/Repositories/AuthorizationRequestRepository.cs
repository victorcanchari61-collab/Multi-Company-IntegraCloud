using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

public sealed class AuthorizationRequestRepository : IAuthorizationRequestRepository
{
    private readonly IamDbContext _db;

    public AuthorizationRequestRepository(IamDbContext db) => _db = db;

    public async Task<AuthorizationRequest?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Set<AuthorizationRequest>().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<AuthorizationRequest>> GetPendingByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.Set<AuthorizationRequest>()
            .Where(x => x.UserId == userId && x.Estado == "pendiente")
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<AuthorizationRequest>> GetPendingByAutorizadorAsync(Guid autorizadorId, CancellationToken ct = default)
        => await _db.Set<AuthorizationRequest>()
            .Where(x => x.Estado == "pendiente")
            .Include(x => x.User)
            .ToListAsync(ct);

    public async Task<List<AuthorizationRequest>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await _db.Set<AuthorizationRequest>()
            .Include(x => x.User)
            .Where(x => x.User.CompanyId == companyId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(AuthorizationRequest request, CancellationToken ct = default)
        => await _db.Set<AuthorizationRequest>().AddAsync(request, ct);

    public void Update(AuthorizationRequest request)
        => _db.Set<AuthorizationRequest>().Update(request);
}
