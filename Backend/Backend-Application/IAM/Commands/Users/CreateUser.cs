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
