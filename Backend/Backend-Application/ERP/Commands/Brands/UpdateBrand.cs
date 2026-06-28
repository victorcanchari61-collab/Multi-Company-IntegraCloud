using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Brands;

public sealed record UpdateBrandCommand(Guid Id, Guid CompanyId, string Name, string? Description)
    : IRequest<Result>;

public sealed class UpdateBrandCommandHandler(IBrandRepository repository)
    : IRequestHandler<UpdateBrandCommand, Result>
{
    public async Task<Result> Handle(UpdateBrandCommand request, CancellationToken ct)
    {
        var brand = await repository.GetByIdAsync(request.Id, ct);
        if (brand is null)
            return Result.Failure(Error.NotFound("brand.notfound", "Marca no encontrada."));

        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, request.Id, ct))
            return Result.Failure(Error.Conflict("brand.exists", "Ya existe una marca con ese nombre."));

        brand.Update(name, request.Description?.Trim());
        repository.Update(brand);
        return Result.Success();
    }
}
