using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Suppliers;

public sealed record UpdateSupplierCommand(
    Guid Id, Guid CompanyId, string Code, string BusinessName, string? TradeName,
    string? Address, string? Phone, string? Email, string? ContactPerson,
    string? PaymentTerms, decimal? CreditLimit) : IRequest<Result>;

public sealed class UpdateSupplierCommandHandler(ISupplierRepository repository)
    : IRequestHandler<UpdateSupplierCommand, Result>
{
    public async Task<Result> Handle(UpdateSupplierCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("supplier.not_found", "Proveedor no encontrado."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, request.Id, ct))
            return Result.Failure(Error.Conflict("supplier.duplicate_code",
                $"Ya existe un proveedor con el código '{request.Code}'."));

        entity.Update(request.Code, request.BusinessName, request.TradeName, request.Address,
            request.Phone, request.Email, request.ContactPerson, request.PaymentTerms, request.CreditLimit);

        repository.Update(entity);
        return Result.Success();
    }
}
