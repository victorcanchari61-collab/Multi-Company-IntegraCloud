using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class ComponentConfiguration : IEntityTypeConfiguration<Component>
{
    public void Configure(EntityTypeBuilder<Component> builder)
    {
        builder.ToTable("components");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ViewId).HasColumnName("view_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(60).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasOne(x => x.View)
            .WithMany(v => v.Components)
            .HasForeignKey(x => x.ViewId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ViewId, x.Code }).IsUnique();
        builder.HasIndex(x => x.ViewId);
    }
}
