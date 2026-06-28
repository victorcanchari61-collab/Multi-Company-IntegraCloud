using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subcategories;

public sealed record SetSubcategoryStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetSubcategoryStatusCommandHandler(ISubcategoryRepository repository)
    : IRequestHandler<SetSubcategoryStatusCommand, Result>
{
    public async Task<Result> Handle(SetSubcategoryStatusCommand request, CancellationToken ct)
    {
        var subcategory = await repository.GetByIdAsync(request.Id, ct);
        if (subcategory is null || subcategory.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("subcategory.notfound", "Subcategoría no encontrada."));

        if (request.IsActive) subcategory.Activate();
        else subcategory.Deactivate();

        repository.Update(subcategory);
        return Result.Success();
    }
}
