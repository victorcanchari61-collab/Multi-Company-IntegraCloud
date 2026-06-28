using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class SubbrandConfiguration : IEntityTypeConfiguration<Subbrand>
{
    public void Configure(EntityTypeBuilder<Subbrand> builder)
    {
        builder.ToTable("subbrands", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.BrandId).HasColumnName("brand_id").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(500);
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Brand).WithMany(b => b.Subbrands).HasForeignKey(x => x.BrandId);
        builder.HasMany(x => x.Products).WithOne(p => p.Subbrand).HasForeignKey(p => p.SubbrandId);

        builder.HasIndex(x => new { x.CompanyId, x.BrandId, x.Name }).IsUnique();
        builder.HasIndex(x => x.BrandId);
    }
}
