using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Units;

public sealed record SetUnitOfMeasureStatusCommand(Guid Id, Guid CompanyId, bool Active)
    : IRequest<Result>;

public sealed class SetUnitOfMeasureStatusCommandHandler(IUnitOfMeasureRepository repository)
    : IRequestHandler<SetUnitOfMeasureStatusCommand, Result>
{
    public async Task<Result> Handle(SetUnitOfMeasureStatusCommand request, CancellationToken ct)
    {
        var unit = await repository.GetByIdAsync(request.Id, ct);
        if (unit is null || unit.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("unit.not_found", "Unidad no encontrada."));

        if (request.Active) unit.Activate();
        else unit.Deactivate();
        repository.Update(unit);

        return Result.Success();
    }
}
