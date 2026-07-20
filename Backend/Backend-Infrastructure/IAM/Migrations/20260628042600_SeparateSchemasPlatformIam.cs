using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class SeparateSchemasPlatformIam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "platform");

            migrationBuilder.EnsureSchema(
                name: "iam");

            migrationBuilder.RenameTable(
                name: "views",
                newName: "views",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "users",
                newSchema: "iam");

            migrationBuilder.RenameTable(
                name: "user_roles",
                newName: "user_roles",
                newSchema: "iam");

            migrationBuilder.RenameTable(
                name: "systems",
                newName: "systems",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "roles",
                newName: "roles",
                newSchema: "iam");

            migrationBuilder.RenameTable(
                name: "role_permissions",
                newName: "role_permissions",
                newSchema: "iam");

            migrationBuilder.RenameTable(
                name: "refresh_tokens",
                newName: "refresh_tokens",
                newSchema: "iam");

            migrationBuilder.RenameTable(
                name: "permissions",
                newName: "permissions",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "modules",
                newName: "modules",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "components",
                newName: "components",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "company_module_access",
                newName: "company_module_access",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "companies",
                newName: "companies",
                newSchema: "platform");

            migrationBuilder.RenameTable(
                name: "actions",
                newName: "actions",
                newSchema: "platform");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "views",
                schema: "platform",
                newName: "views");

            migrationBuilder.RenameTable(
                name: "users",
                schema: "iam",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "user_roles",
                schema: "iam",
                newName: "user_roles");

            migrationBuilder.RenameTable(
                name: "systems",
                schema: "platform",
                newName: "systems");

            migrationBuilder.RenameTable(
                name: "roles",
                schema: "iam",
                newName: "roles");

            migrationBuilder.RenameTable(
                name: "role_permissions",
                schema: "iam",
                newName: "role_permissions");

            migrationBuilder.RenameTable(
                name: "refresh_tokens",
                schema: "iam",
                newName: "refresh_tokens");

            migrationBuilder.RenameTable(
                name: "permissions",
                schema: "platform",
                newName: "permissions");

            migrationBuilder.RenameTable(
                name: "modules",
                schema: "platform",
                newName: "modules");

            migrationBuilder.RenameTable(
                name: "components",
                schema: "platform",
                newName: "components");

            migrationBuilder.RenameTable(
                name: "company_module_access",
                schema: "platform",
                newName: "company_module_access");

            migrationBuilder.RenameTable(
                name: "companies",
                schema: "platform",
                newName: "companies");

            migrationBuilder.RenameTable(
                name: "actions",
                schema: "platform",
                newName: "actions");
        }
    }
}
