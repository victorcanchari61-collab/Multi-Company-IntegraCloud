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
    // Provisioning del administrador inicial de la empresa.
    string? AdminEmail = null,
    string? AdminFullName = null,
    string? AdminPassword = null,
    Guid? CreatedBy = null)
    : IRequest<Result<Guid>>;

public sealed class CreateCompanyCommandHandler(
    ICompanyRepository companyRepository,
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHasher passwordHasher,
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

        // Provisioning: crea el primer admin de la empresa (rol "Administrador" + usuario).
        if (!string.IsNullOrWhiteSpace(request.AdminEmail)
            && !string.IsNullOrWhiteSpace(request.AdminPassword))
        {
            var role = new Role(Guid.NewGuid(), company.Id, "Administrador", "Administrador de la empresa");
            await roleRepository.AddAsync(role, ct);

            var fullName = string.IsNullOrWhiteSpace(request.AdminFullName)
                ? request.AdminEmail.Trim()
                : request.AdminFullName.Trim();

            var admin = new User(
                Guid.NewGuid(),
                companyId: company.Id,
                email: request.AdminEmail.Trim(),
                passwordHash: passwordHasher.Hash(request.AdminPassword),
                fullName: fullName,
                isOwner: false);
            admin.AssignRole(role.Id);

            await userRepository.AddAsync(admin, ct);
        }

        await publisher.Publish(new CompanyCreatedEvent(company.Id, company.Name), ct);

        return Result<Guid>.Success(company.Id);
    }
}
