using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Users;

public sealed record GetUserRestrictionsQuery(Guid UserId) : IRequest<Result<List<string>>>;

public sealed class GetUserRestrictionsQueryHandler(
    IUserRestrictionRepository restrictionRepository)
    : IRequestHandler<GetUserRestrictionsQuery, Result<List<string>>>
{
    public async Task<Result<List<string>>> Handle(GetUserRestrictionsQuery request, CancellationToken ct)
    {
        var restrictions = await restrictionRepository.GetByUserIdAsync(request.UserId, ct);
        return Result<List<string>>.Success(
            restrictions.Select(r => r.RestrictedKey).ToList());
    }
}
