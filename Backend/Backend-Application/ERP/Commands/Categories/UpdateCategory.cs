using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Categories;

public sealed record UpdateCategoryCommand(Guid Id, Guid CompanyId, string Name, string? Description)
    : IRequest<Result>;

public sealed class UpdateCategoryCommandHandler(ICategoryRepository repository)
    : IRequestHandler<UpdateCategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await repository.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Failure(Error.NotFound("category.notfound", "Categoría no encontrada."));

        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, request.Id, ct))
            return Result.Failure(Error.Conflict("category.exists", "Ya existe una categoría con ese nombre."));

        category.Update(name, request.Description?.Trim());
        repository.Update(category);
        return Result.Success();
    }
}
