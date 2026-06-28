using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record UpdateUserCommand(
    Guid UserId,
    string FullName,
    string Email) : IRequest<Result>;

public sealed class UpdateUserCommandHandler(
    IUserRepository userRepository)
    : IRequestHandler<UpdateUserCommand, Result>
{
    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("user.not_found", "User not found."));

        var duplicate = await userRepository.GetByEmailAsync(user.CompanyId, request.Email, ct);
        if (duplicate is not null && duplicate.Id != request.UserId)
            return Result.Failure(
                Error.Conflict("user.email_exists", "A user with this email already exists in the company."));

        user.UpdateProfile(request.FullName, request.Email);
        userRepository.Update(user);
        return Result.Success();
    }
}
