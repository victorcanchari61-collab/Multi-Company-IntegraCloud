using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Customers;

public sealed record UpdateCustomerCommand(
    Guid Id, Guid CompanyId, string Code, string BusinessName, string? TradeName,
    string? TaxId, string? Address, string? Phone, string? Email,
    string? ContactPerson, decimal? CreditLimit) : IRequest<Result>;

public sealed class UpdateCustomerCommandHandler(ICustomerRepository repository)
    : IRequestHandler<UpdateCustomerCommand, Result>
{
    public async Task<Result> Handle(UpdateCustomerCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("customer.not_found", "Cliente no encontrado."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, request.Id, ct))
            return Result.Failure(Error.Conflict("customer.duplicate_code",
                $"Ya existe un cliente con el código '{request.Code}'."));

        entity.Update(request.Code, request.BusinessName, request.TradeName, request.TaxId,
            request.Address, request.Phone, request.Email, request.ContactPerson, request.CreditLimit);

        repository.Update(entity);
        return Result.Success();
    }
}
