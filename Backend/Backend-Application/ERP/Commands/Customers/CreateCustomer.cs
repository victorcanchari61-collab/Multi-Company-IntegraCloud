using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Customers;

public sealed record CreateCustomerCommand(
    Guid CompanyId, string Code, string BusinessName, string? TradeName,
    string? TaxId, string? Address, string? Phone, string? Email,
    string? ContactPerson, decimal? CreditLimit) : IRequest<Result<Guid>>;

public sealed class CreateCustomerCommandHandler(ICustomerRepository repository)
    : IRequestHandler<CreateCustomerCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCustomerCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, null, ct))
            return Result<Guid>.Failure(Error.Conflict("customer.duplicate_code",
                $"Ya existe un cliente con el código '{request.Code}'."));

        var customer = new Customer(Guid.NewGuid(), request.CompanyId, request.Code, request.BusinessName,
            request.TradeName, request.TaxId, request.Address, request.Phone, request.Email,
            request.ContactPerson, request.CreditLimit);

        await repository.AddAsync(customer, ct);
        return Result<Guid>.Success(customer.Id);
    }
}
