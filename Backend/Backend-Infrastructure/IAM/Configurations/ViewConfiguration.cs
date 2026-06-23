using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class ViewConfiguration : IEntityTypeConfiguration<View>
{
    public void Configure(EntityTypeBuilder<View> builder)
    {
        builder.ToTable("views");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleId).HasColumnName("module_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(60).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Route).HasColumnName("route").HasMaxLength(150);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.Views)
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ModuleId, x.Code }).IsUnique();
        builder.HasIndex(x => x.ModuleId);
    }
}
