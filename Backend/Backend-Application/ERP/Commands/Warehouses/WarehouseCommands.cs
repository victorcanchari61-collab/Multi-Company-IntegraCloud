using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Warehouses;

public sealed record CreateWarehouseCommand(
    Guid CompanyId, string Code, string Name, string? Type, string? Location)
    : IRequest<Result<Guid>>;

public sealed record UpdateWarehouseCommand(
    Guid Id, Guid CompanyId, string Code, string Name, string? Type, string? Location)
    : IRequest<Result>;

public sealed record SetWarehouseStatusCommand(Guid Id, Guid CompanyId, bool IsActive)
    : IRequest<Result>;

public sealed class CreateWarehouseCommandHandler(IWarehouseRepository repository)
    : IRequestHandler<CreateWarehouseCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateWarehouseCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code.Trim(), null, ct))
            return Result<Guid>.Failure(Error.Conflict("warehouse.code.exists", "Ya existe un almacén con ese código."));

        var warehouse = new Warehouse(Guid.NewGuid(), request.CompanyId, request.Code.Trim(),
            request.Name.Trim(), request.Type?.Trim(), request.Location?.Trim());
        await repository.AddAsync(warehouse, ct);
        return Result<Guid>.Success(warehouse.Id);
    }
}

public sealed class UpdateWarehouseCommandHandler(IWarehouseRepository repository)
    : IRequestHandler<UpdateWarehouseCommand, Result>
{
    public async Task<Result> Handle(UpdateWarehouseCommand request, CancellationToken ct)
    {
        var warehouse = await repository.GetByIdAsync(request.Id, ct);
        if (warehouse is null || warehouse.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("warehouse.notfound", "Almacén no encontrado."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code.Trim(), request.Id, ct))
            return Result.Failure(Error.Conflict("warehouse.code.exists", "Ya existe un almacén con ese código."));

        warehouse.Update(request.Code.Trim(), request.Name.Trim(), request.Type?.Trim(), request.Location?.Trim());
        repository.Update(warehouse);
        return Result.Success();
    }
}

public sealed class SetWarehouseStatusCommandHandler(IWarehouseRepository repository)
    : IRequestHandler<SetWarehouseStatusCommand, Result>
{
    public async Task<Result> Handle(SetWarehouseStatusCommand request, CancellationToken ct)
    {
        var warehouse = await repository.GetByIdAsync(request.Id, ct);
        if (warehouse is null || warehouse.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("warehouse.notfound", "Almacén no encontrado."));

        if (request.IsActive) warehouse.Activate();
        else warehouse.Deactivate();
        repository.Update(warehouse);
        return Result.Success();
    }
}
