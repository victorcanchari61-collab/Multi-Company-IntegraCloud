using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SalesCommissions;

public sealed record GetSalesCommissionsQuery(Guid CompanyId) : IRequest<Result<List<SalesCommissionDto>>>;

public sealed class GetSalesCommissionsQueryHandler(ISalesCommissionRepository repository)
    : IRequestHandler<GetSalesCommissionsQuery, Result<List<SalesCommissionDto>>>
{
    public async Task<Result<List<SalesCommissionDto>>> Handle(GetSalesCommissionsQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(c => new SalesCommissionDto(
            c.Id, c.Code, c.Name, c.SalesAgentName, c.CommissionRate, c.IsActive)).ToList();
        return Result<List<SalesCommissionDto>>.Success(dtos);
    }
}
