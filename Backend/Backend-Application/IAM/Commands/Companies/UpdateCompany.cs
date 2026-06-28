using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record UpdateCompanyCommand(
    Guid Id,
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
    // Credenciales SUNAT: solo se actualizan las enviadas (cifradas).
    string? SolUser = null,
    string? SolPassword = null,
    string? CertificatePassword = null,
    string? CertificateFileName = null,
    string? CertificateContent = null)
    : IRequest<Result>;

public sealed class UpdateCompanyCommandHandler(
    ICompanyRepository companyRepository,
    ICompanyBillingCredentialRepository billingRepository,
    ISecretProtector secretProtector)
    : IRequestHandler<UpdateCompanyCommand, Result>
{
    public async Task<Result> Handle(UpdateCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.Id, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        // Slug único (subdominio).
        var bySlug = await companyRepository.GetBySlugAsync(request.Slug, ct);
        if (bySlug is not null && bySlug.Id != request.Id)
            return Result.Failure(
                Error.Conflict("company.slug_exists", "A company with this subdomain already exists."));

        if (request.TaxId is not null)
        {
            var byTaxId = await companyRepository.GetByTaxIdAsync(request.TaxId, ct);
            if (byTaxId is not null && byTaxId.Id != request.Id)
                return Result.Failure(
                    Error.Conflict("company.tax_id_exists", "A company with this Tax ID already exists."));
        }

        company.Update(
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
            request.SettlementCurrency);

        companyRepository.Update(company);

        await UpsertBillingCredentials(request, ct);

        return Result.Success();
    }

    private async Task UpsertBillingCredentials(UpdateCompanyCommand request, CancellationToken ct)
    {
        string? Enc(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : secretProtector.Protect(value);

        var solUser = Enc(request.SolUser);
        var solPassword = Enc(request.SolPassword);
        var certificateContent = Enc(request.CertificateContent);
        var certificatePassword = Enc(request.CertificatePassword);
        var certificateFileName = string.IsNullOrWhiteSpace(request.CertificateFileName)
            ? null
            : request.CertificateFileName.Trim();

        var hasChanges = solUser is not null || solPassword is not null
            || certificateContent is not null || certificatePassword is not null
            || certificateFileName is not null;
        if (!hasChanges) return;

        var existing = await billingRepository.GetByCompanyIdAsync(request.Id, ct);
        if (existing is null)
        {
            var credential = new CompanyBillingCredential(
                Guid.NewGuid(), request.Id,
                solUser, solPassword, certificateContent, certificatePassword, certificateFileName);
            await billingRepository.AddAsync(credential, ct);
        }
        else
        {
            existing.Apply(solUser, solPassword, certificateContent, certificatePassword, certificateFileName);
            billingRepository.Update(existing);
        }
    }
}
