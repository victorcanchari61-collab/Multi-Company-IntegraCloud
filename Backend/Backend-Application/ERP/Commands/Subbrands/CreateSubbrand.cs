using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subbrands;

public sealed record CreateSubbrandCommand(Guid CompanyId, Guid BrandId, string Name, string? Description)
    : IRequest<Result<Guid>>;

public sealed class CreateSubbrandCommandHandler(ISubbrandRepository repository)
    : IRequestHandler<CreateSubbrandCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSubbrandCommand request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, request.BrandId, name, null, ct))
            return Result<Guid>.Failure(Error.Conflict("subbrand.exists", "Ya existe una submarca con ese nombre en esta marca."));

        var subbrand = new Subbrand(Guid.NewGuid(), request.CompanyId, request.BrandId, name, request.Description?.Trim());
        await repository.AddAsync(subbrand, ct);
        return Result<Guid>.Success(subbrand.Id);
    }
}
