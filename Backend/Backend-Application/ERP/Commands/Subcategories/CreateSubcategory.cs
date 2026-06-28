using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subcategories;

public sealed record CreateSubcategoryCommand(Guid CompanyId, Guid CategoryId, string Name, string? Description)
    : IRequest<Result<Guid>>;

public sealed class CreateSubcategoryCommandHandler(ISubcategoryRepository repository)
    : IRequestHandler<CreateSubcategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSubcategoryCommand request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, request.CategoryId, name, null, ct))
            return Result<Guid>.Failure(Error.Conflict("subcategory.exists", "Ya existe una subcategoría con ese nombre en esta categoría."));

        var subcategory = new Subcategory(Guid.NewGuid(), request.CompanyId, request.CategoryId, name, request.Description?.Trim());
        await repository.AddAsync(subcategory, ct);
        return Result<Guid>.Success(subcategory.Id);
    }
}
