using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record AddUserRestrictionCommand(Guid UserId, string RestrictedKey) : IRequest<Result>;

public sealed class AddUserRestrictionCommandHandler(
    IUserRestrictionRepository restrictionRepository)
    : IRequestHandler<AddUserRestrictionCommand, Result>
{
    public async Task<Result> Handle(AddUserRestrictionCommand request, CancellationToken ct)
    {
        var existing = await restrictionRepository.GetByUserIdAsync(request.UserId, ct);
        if (existing.Any(r => r.RestrictedKey == request.RestrictedKey))
            return Result.Success();

        var restriction = new Domain.IAM.Entities.UserRestriction(request.UserId, request.RestrictedKey);
        await restrictionRepository.AddAsync(restriction, ct);
        return Result.Success();
    }
}
