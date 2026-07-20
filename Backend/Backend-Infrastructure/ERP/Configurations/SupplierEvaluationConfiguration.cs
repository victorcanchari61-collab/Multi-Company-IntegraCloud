using Backend.Domain.ERP.Entities.Compras;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class SupplierEvaluationConfiguration : IEntityTypeConfiguration<SupplierEvaluation>
{
    public void Configure(EntityTypeBuilder<SupplierEvaluation> builder)
    {
        builder.ToTable("supplier_evaluations", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.SupplierId).HasColumnName("supplier_id").IsRequired();
        builder.Property(x => x.EvaluationDate).HasColumnName("evaluation_date").IsRequired();
        builder.Property(x => x.Score).HasColumnName("score").IsRequired();
        builder.Property(x => x.EvaluatedBy).HasColumnName("evaluated_by").HasMaxLength(200).IsRequired();
        builder.Property(x => x.PriceRating).HasColumnName("price_rating").HasPrecision(3, 1);
        builder.Property(x => x.QualityRating).HasColumnName("quality_rating").HasPrecision(3, 1);
        builder.Property(x => x.DeliveryRating).HasColumnName("delivery_rating").HasPrecision(3, 1);
        builder.Property(x => x.ServiceRating).HasColumnName("service_rating").HasPrecision(3, 1);
        builder.Property(x => x.Comments).HasColumnName("comments").HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId);

        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.SupplierId);
    }
}
