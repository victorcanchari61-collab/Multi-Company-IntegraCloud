using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Brands;

public sealed record SetBrandStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetBrandStatusCommandHandler(IBrandRepository repository)
    : IRequestHandler<SetBrandStatusCommand, Result>
{
    public async Task<Result> Handle(SetBrandStatusCommand request, CancellationToken ct)
    {
        var brand = await repository.GetByIdAsync(request.Id, ct);
        if (brand is null || brand.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("brand.notfound", "Marca no encontrada."));

        if (request.IsActive) brand.Activate();
        else brand.Deactivate();

        repository.Update(brand);
        return Result.Success();
    }
}
