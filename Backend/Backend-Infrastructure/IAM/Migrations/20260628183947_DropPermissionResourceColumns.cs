using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class DropPermissionResourceColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_permissions_resource_type_resource_id_action_code",
                schema: "platform",
                table: "permissions");

            migrationBuilder.DropColumn(
                name: "resource_id",
                schema: "platform",
                table: "permissions");

            migrationBuilder.DropColumn(
                name: "resource_type",
                schema: "platform",
                table: "permissions");

            migrationBuilder.CreateIndex(
                name: "IX_permissions_module_id_action_code",
                schema: "platform",
                table: "permissions",
                columns: new[] { "module_id", "action_code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_permissions_module_id_action_code",
                schema: "platform",
                table: "permissions");

            migrationBuilder.AddColumn<Guid>(
                name: "resource_id",
                schema: "platform",
                table: "permissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "resource_type",
                schema: "platform",
                table: "permissions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_permissions_resource_type_resource_id_action_code",
                schema: "platform",
                table: "permissions",
                columns: new[] { "resource_type", "resource_id", "action_code" },
                unique: true);
        }
    }
}
