using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class CompanyBillingCredentialConfiguration
    : IEntityTypeConfiguration<CompanyBillingCredential>
{
    public void Configure(EntityTypeBuilder<CompanyBillingCredential> builder)
    {
        builder.ToTable("company_billing_credentials", "secrets");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.SolUser).HasColumnName("sol_user");
        builder.Property(x => x.SolPassword).HasColumnName("sol_password");
        builder.Property(x => x.CertificateContent).HasColumnName("certificate_content");
        builder.Property(x => x.CertificatePassword).HasColumnName("certificate_password");
        builder.Property(x => x.CertificateFileName).HasColumnName("certificate_file_name").HasMaxLength(255);
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();

        // 1:1 con la empresa (FK entre schemas secrets → platform, válido en Postgres).
        builder.HasOne<Company>()
            .WithOne()
            .HasForeignKey<CompanyBillingCredential>(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.CompanyId).IsUnique();
    }
}
