using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Brands;

public sealed record CreateBrandCommand(Guid CompanyId, string Name, string? Description)
    : IRequest<Result<Guid>>;

public sealed class CreateBrandCommandHandler(IBrandRepository repository)
    : IRequestHandler<CreateBrandCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateBrandCommand request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        if (await repository.ExistsByNameAsync(request.CompanyId, name, null, ct))
            return Result<Guid>.Failure(Error.Conflict("brand.exists", "Ya existe una marca con ese nombre."));

        var brand = new Brand(Guid.NewGuid(), request.CompanyId, name, request.Description?.Trim());
        await repository.AddAsync(brand, ct);
        return Result<Guid>.Success(brand.Id);
    }
}
