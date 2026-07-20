using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subbrands;

public sealed record UpdateSubbrandCommand(Guid Id, Guid CompanyId, Guid BrandId, string Name, string? Description)
    : IRequest<Result>;

public sealed class UpdateSubbrandCommandHandler(ISubbrandRepository repository)
    : IRequestHandler<UpdateSubbrandCommand, Result>
{
    public async Task<Result> Handle(UpdateSubbrandCommand request, CancellationToken ct)
    {
        var subbrand = await repository.GetByIdAsync(request.Id, ct);
        if (subbrand is null)
            return Result.Failure(Error.NotFound("subbrand.notfound", "Submarca no encontrada."));

        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, request.BrandId, name, request.Id, ct))
            return Result.Failure(Error.Conflict("subbrand.exists", "Ya existe una submarca con ese nombre en esta marca."));

        subbrand.Update(request.BrandId, name, request.Description?.Trim());
        repository.Update(subbrand);
        return Result.Success();
    }
}
