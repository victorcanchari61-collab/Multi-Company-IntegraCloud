using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Customers;

public sealed record GetCustomerByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<CustomerDto>>;

public sealed class GetCustomerByIdQueryHandler(ICustomerRepository repository)
    : IRequestHandler<GetCustomerByIdQuery, Result<CustomerDto>>
{
    public async Task<Result<CustomerDto>> Handle(GetCustomerByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result<CustomerDto>.Failure(Error.NotFound("customer.not_found", "Cliente no encontrado."));
        return Result<CustomerDto>.Success(new CustomerDto(
            entity.Id, entity.Code, entity.BusinessName, entity.TradeName, entity.TaxId,
            entity.Address, entity.Phone, entity.Email, entity.ContactPerson,
            entity.CreditLimit, entity.IsActive));
    }
}
