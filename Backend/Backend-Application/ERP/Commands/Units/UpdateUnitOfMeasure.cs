using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Units;

public sealed record UpdateUnitOfMeasureCommand(Guid Id, Guid CompanyId, string Name, string Abbreviation)
    : IRequest<Result>;

public sealed class UpdateUnitOfMeasureCommandHandler(IUnitOfMeasureRepository repository)
    : IRequestHandler<UpdateUnitOfMeasureCommand, Result>
{
    public async Task<Result> Handle(UpdateUnitOfMeasureCommand request, CancellationToken ct)
    {
        var unit = await repository.GetByIdAsync(request.Id, ct);
        if (unit is null || unit.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("unit.not_found", "Unidad no encontrada."));

        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, request.Id, ct))
            return Result.Failure(Error.Conflict("unit.exists", "Ya existe una unidad con ese nombre."));

        unit.Update(name, request.Abbreviation.Trim());
        repository.Update(unit);

        return Result.Success();
    }
}
