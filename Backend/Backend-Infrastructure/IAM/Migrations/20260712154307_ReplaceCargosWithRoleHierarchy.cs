using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceCargosWithRoleHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cargos",
                schema: "iam");

            migrationBuilder.AddColumn<Guid>(
                name: "parent_role_id",
                schema: "iam",
                table: "roles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "sort_order",
                schema: "iam",
                table: "roles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_roles_parent_role_id",
                schema: "iam",
                table: "roles",
                column: "parent_role_id");

            migrationBuilder.AddForeignKey(
                name: "FK_roles_roles_parent_role_id",
                schema: "iam",
                table: "roles",
                column: "parent_role_id",
                principalSchema: "iam",
                principalTable: "roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_roles_roles_parent_role_id",
                schema: "iam",
                table: "roles");

            migrationBuilder.DropIndex(
                name: "IX_roles_parent_role_id",
                schema: "iam",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "parent_role_id",
                schema: "iam",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "sort_order",
                schema: "iam",
                table: "roles");

            migrationBuilder.CreateTable(
                name: "cargos",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    role_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cargos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cargos_cargos_parent_id",
                        column: x => x.parent_id,
                        principalSchema: "iam",
                        principalTable: "cargos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cargos_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "platform",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_cargos_roles_role_id",
                        column: x => x.role_id,
                        principalSchema: "iam",
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cargos_company_id_name",
                schema: "iam",
                table: "cargos",
                columns: new[] { "company_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cargos_parent_id",
                schema: "iam",
                table: "cargos",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_cargos_role_id",
                schema: "iam",
                table: "cargos",
                column: "role_id");
        }
    }
}
