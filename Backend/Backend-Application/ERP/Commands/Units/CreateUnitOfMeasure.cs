using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Units;

public sealed record CreateUnitOfMeasureCommand(Guid CompanyId, string Name, string Abbreviation)
    : IRequest<Result<Guid>>;

public sealed class CreateUnitOfMeasureCommandHandler(IUnitOfMeasureRepository repository)
    : IRequestHandler<CreateUnitOfMeasureCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateUnitOfMeasureCommand request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, null, ct))
            return Result<Guid>.Failure(Error.Conflict("unit.exists", "Ya existe una unidad con ese nombre."));

        var unit = new UnitOfMeasure(Guid.NewGuid(), request.CompanyId, name, request.Abbreviation.Trim());
        await repository.AddAsync(unit, ct);

        return Result<Guid>.Success(unit.Id);
    }
}
