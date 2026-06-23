using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class ActionConfiguration : IEntityTypeConfiguration<PermissionAction>
{
    public void Configure(EntityTypeBuilder<PermissionAction> builder)
    {
        builder.ToTable("actions");

        builder.HasKey(x => x.Code);
        builder.Ignore(x => x.Id);
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(30);
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(60).IsRequired();
    }
}
