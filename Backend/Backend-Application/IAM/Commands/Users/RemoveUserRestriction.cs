using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record RemoveUserRestrictionCommand(Guid UserId, string RestrictedKey) : IRequest<Result>;

public sealed class RemoveUserRestrictionCommandHandler(
    IUserRestrictionRepository restrictionRepository)
    : IRequestHandler<RemoveUserRestrictionCommand, Result>
{
    public async Task<Result> Handle(RemoveUserRestrictionCommand request, CancellationToken ct)
    {
        var existing = await restrictionRepository.GetByUserIdAsync(request.UserId, ct);
        var match = existing.FirstOrDefault(r => r.RestrictedKey == request.RestrictedKey);
        if (match is null)
            return Result.Success();

        restrictionRepository.Delete(match);
        return Result.Success();
    }
}
