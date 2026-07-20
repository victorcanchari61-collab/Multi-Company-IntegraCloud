using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Categories;

public sealed record SetCategoryStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetCategoryStatusCommandHandler(ICategoryRepository repository)
    : IRequestHandler<SetCategoryStatusCommand, Result>
{
    public async Task<Result> Handle(SetCategoryStatusCommand request, CancellationToken ct)
    {
        var category = await repository.GetByIdAsync(request.Id, ct);
        if (category is null || category.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("category.notfound", "Categoría no encontrada."));

        if (request.IsActive) category.Activate();
        else category.Deactivate();

        repository.Update(category);
        return Result.Success();
    }
}
