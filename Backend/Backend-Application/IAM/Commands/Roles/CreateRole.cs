using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record CreateRoleCommand(
    Guid CompanyId,
    string Name,
    string? Description) : IRequest<Result<Guid>>;

public sealed class CreateRoleCommandHandler(IRoleRepository roleRepository)
    : IRequestHandler<CreateRoleCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateRoleCommand request, CancellationToken ct)
    {
        var role = new Role(Guid.NewGuid(), request.CompanyId, request.Name, request.Description);
        await roleRepository.AddAsync(role, ct);
        return Result<Guid>.Success(role.Id);
    }
}
