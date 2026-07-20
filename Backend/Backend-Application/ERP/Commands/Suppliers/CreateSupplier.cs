using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Suppliers;

public sealed record CreateSupplierCommand(
    Guid CompanyId, string Code, string BusinessName, string? TradeName,
    string? Address, string? Phone, string? Email, string? ContactPerson,
    string? PaymentTerms, decimal? CreditLimit) : IRequest<Result<Guid>>;

public sealed class CreateSupplierCommandHandler(ISupplierRepository repository)
    : IRequestHandler<CreateSupplierCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSupplierCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, null, ct))
            return Result<Guid>.Failure(Error.Conflict("supplier.duplicate_code",
                $"Ya existe un proveedor con el código '{request.Code}'."));

        var supplier = new Supplier(Guid.NewGuid(), request.CompanyId, request.Code, request.BusinessName,
            request.TradeName, request.Address, request.Phone, request.Email,
            request.ContactPerson, request.PaymentTerms, request.CreditLimit);

        await repository.AddAsync(supplier, ct);
        return Result<Guid>.Success(supplier.Id);
    }
}
