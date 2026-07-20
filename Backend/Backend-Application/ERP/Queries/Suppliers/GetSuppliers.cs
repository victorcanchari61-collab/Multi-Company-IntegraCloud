using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Suppliers;

public sealed record GetSuppliersQuery(Guid CompanyId) : IRequest<Result<List<SupplierDto>>>;

public sealed class GetSuppliersQueryHandler(ISupplierRepository repository)
    : IRequestHandler<GetSuppliersQuery, Result<List<SupplierDto>>>
{
    public async Task<Result<List<SupplierDto>>> Handle(GetSuppliersQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(s => new SupplierDto(
            s.Id, s.Code, s.BusinessName, s.TradeName, s.Address, s.Phone,
            s.Email, s.ContactPerson, s.PaymentTerms, s.CreditLimit, s.IsActive)).ToList();
        return Result<List<SupplierDto>>.Success(dtos);
    }
}
