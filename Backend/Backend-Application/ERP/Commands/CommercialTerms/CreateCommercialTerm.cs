using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.CommercialTerms;

public sealed record CreateCommercialTermCommand(
    Guid CompanyId, string Code, string Name, string? Description, int PaymentDays) : IRequest<Result<Guid>>;

public sealed class CreateCommercialTermCommandHandler(ICommercialTermRepository repository)
    : IRequestHandler<CreateCommercialTermCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCommercialTermCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, null, ct))
            return Result<Guid>.Failure(Error.Conflict("commercial_term.duplicate_code",
                $"Ya existe una condición comercial con el código '{request.Code}'."));

        var entity = new CommercialTerm(Guid.NewGuid(), request.CompanyId, request.Code, request.Name,
            request.Description, request.PaymentDays);

        await repository.AddAsync(entity, ct);
        return Result<Guid>.Success(entity.Id);
    }
}
