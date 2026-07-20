using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Units;

public sealed record GetUnitsOfMeasureQuery(Guid CompanyId) : IRequest<Result<List<UnitOfMeasureDto>>>;

public sealed class GetUnitsOfMeasureQueryHandler(IUnitOfMeasureRepository repository)
    : IRequestHandler<GetUnitsOfMeasureQuery, Result<List<UnitOfMeasureDto>>>
{
    public async Task<Result<List<UnitOfMeasureDto>>> Handle(GetUnitsOfMeasureQuery request, CancellationToken ct)
    {
        var units = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = units
            .Select(u => new UnitOfMeasureDto(u.Id, u.Name, u.Abbreviation, u.IsActive))
            .ToList();
        return Result<List<UnitOfMeasureDto>>.Success(dtos);
    }
}
