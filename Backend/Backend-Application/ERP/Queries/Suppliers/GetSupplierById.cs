using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Suppliers;

public sealed record GetSupplierByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<SupplierDto>>;

public sealed class GetSupplierByIdQueryHandler(ISupplierRepository repository)
    : IRequestHandler<GetSupplierByIdQuery, Result<SupplierDto>>
{
    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result<SupplierDto>.Failure(Error.NotFound("supplier.not_found", "Proveedor no encontrado."));
        return Result<SupplierDto>.Success(new SupplierDto(
            entity.Id, entity.Code, entity.BusinessName, entity.TradeName, entity.Address,
            entity.Phone, entity.Email, entity.ContactPerson, entity.PaymentTerms,
            entity.CreditLimit, entity.IsActive));
    }
}
