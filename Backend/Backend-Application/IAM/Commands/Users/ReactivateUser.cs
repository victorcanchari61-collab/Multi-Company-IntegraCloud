using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record ReactivateUserCommand(Guid UserId) : IRequest<Result>;

public sealed class ReactivateUserCommandHandler(IUserRepository userRepository)
    : IRequestHandler<ReactivateUserCommand, Result>
{
    public async Task<Result> Handle(ReactivateUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("user.not_found", "User not found."));

        user.Activate();
        userRepository.Update(user);
        return Result.Success();
    }
}
