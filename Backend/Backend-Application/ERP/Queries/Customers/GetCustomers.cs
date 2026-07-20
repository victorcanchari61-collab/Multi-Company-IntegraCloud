using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Customers;

public sealed record GetCustomersQuery(Guid CompanyId) : IRequest<Result<List<CustomerDto>>>;

public sealed class GetCustomersQueryHandler(ICustomerRepository repository)
    : IRequestHandler<GetCustomersQuery, Result<List<CustomerDto>>>
{
    public async Task<Result<List<CustomerDto>>> Handle(GetCustomersQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(c => new CustomerDto(
            c.Id, c.Code, c.BusinessName, c.TradeName, c.TaxId, c.Address, c.Phone,
            c.Email, c.ContactPerson, c.CreditLimit, c.IsActive)).ToList();
        return Result<List<CustomerDto>>.Success(dtos);
    }
}
