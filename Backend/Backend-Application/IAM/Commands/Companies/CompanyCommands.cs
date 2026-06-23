using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Events;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record CreateCompanyCommand(
    string Name,
    string Slug,
    string? LegalName,
    string? LogoUrl,
    string? Email,
    string? Phone,
    string? Website,
    string? Address,
    string? TaxId,
    string? TaxAddress,
    string? EconomicActivity,
    int TaxpayerType = 1,
    bool AccountingRequired = false,
    string SettlementCurrency = "PEN",
    Guid? CreatedBy = null)
    : IRequest<Result<Guid>>;

public sealed class CreateCompanyCommandHandler(
    ICompanyRepository companyRepository,
    IPublisher publisher)
    : IRequestHandler<CreateCompanyCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCompanyCommand request, CancellationToken ct)
    {
        if (request.TaxId is not null)
        {
            var existing = await companyRepository.GetByTaxIdAsync(request.TaxId, ct);
            if (existing is not null)
                return Result<Guid>.Failure(
                    Error.Conflict("company.tax_id_exists", "A company with this Tax ID already exists."));
        }

        var company = new Company(
            Guid.NewGuid(),
            request.Name,
            request.Slug,
            request.LegalName,
            request.LogoUrl,
            request.Email,
            request.Phone,
            request.Website,
            request.Address,
            request.TaxId,
            request.TaxAddress,
            request.EconomicActivity,
            request.TaxpayerType,
            request.AccountingRequired,
            request.SettlementCurrency,
            request.CreatedBy);

        await companyRepository.AddAsync(company, ct);

        await publisher.Publish(new CompanyCreatedEvent(company.Id, company.Name), ct);

        return Result<Guid>.Success(company.Id);
    }
}

public sealed record SuspendCompanyCommand(Guid CompanyId) : IRequest<Result>;
public sealed record ActivateCompanyCommand(Guid CompanyId) : IRequest<Result>;

public sealed class SuspendCompanyCommandHandler(ICompanyRepository companyRepository)
    : IRequestHandler<SuspendCompanyCommand, Result>
{
    public async Task<Result> Handle(SuspendCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        company.Suspend();
        return Result.Success();
    }
}

public sealed class ActivateCompanyCommandHandler(ICompanyRepository companyRepository)
    : IRequestHandler<ActivateCompanyCommand, Result>
{
    public async Task<Result> Handle(ActivateCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        company.Activate();
        return Result.Success();
    }
}

public sealed record GrantCompanyModuleAccessCommand(
    Guid CompanyId,
    Guid[] ModuleIds,
    Guid GrantedBy) : IRequest<Result>;

public sealed class GrantCompanyModuleAccessCommandHandler(
    ICompanyModuleAccessRepository accessRepository,
    ICompanyRepository companyRepository,
    IModuleRepository moduleRepository)
    : IRequestHandler<GrantCompanyModuleAccessCommand, Result>
{
    public async Task<Result> Handle(GrantCompanyModuleAccessCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        foreach (var moduleId in request.ModuleIds)
        {
            var module = await moduleRepository.GetByIdAsync(moduleId, ct);
            if (module is null)
                return Result.Failure(Error.NotFound("module.not_found", $"Module {moduleId} not found."));

            var exists = await accessRepository.HasAccessAsync(request.CompanyId, moduleId, ct);
            if (!exists)
            {
                var access = new CompanyModuleAccess(
                    Guid.NewGuid(), request.CompanyId, moduleId, request.GrantedBy);
                await accessRepository.AddAsync(access, ct);
            }
        }

        return Result.Success();
    }
}

public sealed record RevokeCompanyModuleAccessCommand(
    Guid CompanyId,
    Guid[] ModuleIds) : IRequest<Result>;

public sealed class RevokeCompanyModuleAccessCommandHandler(
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<RevokeCompanyModuleAccessCommand, Result>
{
    public async Task<Result> Handle(RevokeCompanyModuleAccessCommand request, CancellationToken ct)
    {
        var accesses = await accessRepository.GetByCompanyIdAsync(request.CompanyId, ct);
        var toRemove = accesses.Where(a => request.ModuleIds.Contains(a.ModuleId)).ToList();

        foreach (var access in toRemove)
            accessRepository.Delete(access);

        return Result.Success();
    }
}
