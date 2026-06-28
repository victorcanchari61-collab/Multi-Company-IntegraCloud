using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("companies", "platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(80).IsRequired();
        builder.Property(x => x.LegalName).HasColumnName("legal_name").HasMaxLength(200);
        // Guarda data URLs (base64) del logo → sin límite de longitud (text).
        builder.Property(x => x.LogoUrl).HasColumnName("logo_url");
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(150);
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
        builder.Property(x => x.Website).HasColumnName("website").HasMaxLength(255);
        builder.Property(x => x.Address).HasColumnName("address").HasMaxLength(300);
        builder.Property(x => x.TaxId).HasColumnName("tax_id").HasMaxLength(20);
        builder.Property(x => x.TaxAddress).HasColumnName("tax_address").HasMaxLength(300);
        builder.Property(x => x.EconomicActivity).HasColumnName("economic_activity").HasMaxLength(255);
        builder.Property(x => x.TaxpayerType).HasColumnName("taxpayer_type").IsRequired().HasDefaultValue(1);
        builder.Property(x => x.AccountingRequired).HasColumnName("accounting_required").IsRequired().HasDefaultValue(false);
        builder.Property(x => x.SettlementCurrency).HasColumnName("settlement_currency").HasMaxLength(3).IsRequired().HasDefaultValue("PEN");
        builder.Property(x => x.Status).HasColumnName("status").IsRequired().HasDefaultValue(1);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.TaxId).IsUnique();
    }
}
