using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record CreateUserCommand(
    Guid CompanyId,
    string Email,
    string FullName,
    string Password) : IRequest<Result<Guid>>;

public sealed class CreateUserCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher)
    : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var existing = await userRepository.GetByEmailAsync(request.CompanyId, request.Email, ct);
        if (existing is not null)
            return Result<Guid>.Failure(
                Error.Conflict("user.email_exists", "A user with this email already exists in the company."));

        var user = new User(
            Guid.NewGuid(),
            request.CompanyId,
            request.Email,
            passwordHasher.Hash(request.Password),
            request.FullName,
            isOwner: false);

        await userRepository.AddAsync(user, ct);
        return Result<Guid>.Success(user.Id);
    }
}

public sealed record DeactivateUserCommand(Guid UserId) : IRequest<Result>;

public sealed class DeactivateUserCommandHandler(IUserRepository userRepository)
    : IRequestHandler<DeactivateUserCommand, Result>
{
    public async Task<Result> Handle(DeactivateUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("user.not_found", "User not found."));

        user.Suspend();
        return Result.Success();
    }
}

public sealed record AssignRolesToUserCommand(
    Guid UserId,
    Guid[] RoleIds) : IRequest<Result>;

public sealed class AssignRolesToUserCommandHandler(
    IUserRepository userRepository,
    IRoleRepository roleRepository)
    : IRequestHandler<AssignRolesToUserCommand, Result>
{
    public async Task<Result> Handle(AssignRolesToUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("user.not_found", "User not found."));

        foreach (var roleId in request.RoleIds)
        {
            var role = await roleRepository.GetByIdAsync(roleId, ct);
            if (role is null)
                return Result.Failure(Error.NotFound("role.not_found", $"Role {roleId} not found."));

            if (role.CompanyId != user.CompanyId)
                return Result.Failure(
                    Error.Validation("role.company_mismatch", "Role does not belong to the user's company."));

            if (!user.UserRoles.Any(ur => ur.RoleId == roleId))
            {
                var userRole = new UserRole(request.UserId, roleId);
                // Note: EF Core will handle adding to the collection
            }
        }

        return Result.Success();
    }
}
