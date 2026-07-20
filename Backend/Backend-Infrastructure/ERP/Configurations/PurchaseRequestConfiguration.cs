using Backend.Domain.ERP.Entities.Compras;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class PurchaseRequestConfiguration : IEntityTypeConfiguration<PurchaseRequest>
{
    public void Configure(EntityTypeBuilder<PurchaseRequest> builder)
    {
        builder.ToTable("purchase_requests", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.RequestNumber).HasColumnName("request_number").HasMaxLength(50).IsRequired();
        builder.Property(x => x.RequesterName).HasColumnName("requester_name").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Department).HasColumnName("department").HasMaxLength(200);
        builder.Property(x => x.RequestDate).HasColumnName("request_date").IsRequired();
        builder.Property(x => x.ExpectedDate).HasColumnName("expected_date");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired()
            .HasConversion<string>();
        builder.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CompanyId, x.RequestNumber }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}

public sealed class PurchaseRequestItemConfiguration : IEntityTypeConfiguration<PurchaseRequestItem>
{
    public void Configure(EntityTypeBuilder<PurchaseRequestItem> builder)
    {
        builder.ToTable("purchase_request_items", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PurchaseRequestId).HasColumnName("purchase_request_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.Quantity).HasColumnName("quantity").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(500);
        builder.Property(x => x.EstimatedPrice).HasColumnName("estimated_price").HasPrecision(18, 4);
    }
}
