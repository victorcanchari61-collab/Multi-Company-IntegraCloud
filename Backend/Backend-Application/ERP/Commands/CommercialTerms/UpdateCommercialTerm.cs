using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.CommercialTerms;

public sealed record UpdateCommercialTermCommand(
    Guid Id, Guid CompanyId, string Code, string Name,
    string? Description, int PaymentDays) : IRequest<Result>;

public sealed class UpdateCommercialTermCommandHandler(ICommercialTermRepository repository)
    : IRequestHandler<UpdateCommercialTermCommand, Result>
{
    public async Task<Result> Handle(UpdateCommercialTermCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("commercial_term.not_found", "Condición comercial no encontrada."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, request.Id, ct))
            return Result.Failure(Error.Conflict("commercial_term.duplicate_code",
                $"Ya existe una condición comercial con el código '{request.Code}'."));

        entity.Update(request.Code, request.Name, request.Description, request.PaymentDays);
        repository.Update(entity);
        return Result.Success();
    }
}
