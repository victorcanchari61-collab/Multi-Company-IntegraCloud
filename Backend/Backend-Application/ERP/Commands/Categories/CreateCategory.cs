using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Categories;

public sealed record CreateCategoryCommand(Guid CompanyId, string Name, string? Description)
    : IRequest<Result<Guid>>;

public sealed class CreateCategoryCommandHandler(ICategoryRepository repository)
    : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, null, ct))
            return Result<Guid>.Failure(Error.Conflict("category.exists", "Ya existe una categoría con ese nombre."));

        var category = new Category(Guid.NewGuid(), request.CompanyId, name, request.Description?.Trim());
        await repository.AddAsync(category, ct);
        return Result<Guid>.Success(category.Id);
    }
}