using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subcategories;

public sealed record UpdateSubcategoryCommand(Guid Id, Guid CompanyId, Guid CategoryId, string Name, string? Description)
    : IRequest<Result>;

public sealed class UpdateSubcategoryCommandHandler(ISubcategoryRepository repository)
    : IRequestHandler<UpdateSubcategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateSubcategoryCommand request, CancellationToken ct)
    {
        var subcategory = await repository.GetByIdAsync(request.Id, ct);
        if (subcategory is null)
            return Result.Failure(Error.NotFound("subcategory.notfound", "Subcategoría no encontrada."));

        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, request.CategoryId, name, request.Id, ct))
            return Result.Failure(Error.Conflict("subcategory.exists", "Ya existe una subcategoría con ese nombre en esta categoría."));

        subcategory.Update(request.CategoryId, name, request.Description?.Trim());
        repository.Update(subcategory);
        return Result.Success();
    }
}
