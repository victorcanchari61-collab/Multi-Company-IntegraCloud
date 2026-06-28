using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class CompanySystemAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "company_system_access",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    system_id = table.Column<Guid>(type: "uuid", nullable: false),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    granted_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_system_access", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_system_access_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "platform",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_company_system_access_systems_system_id",
                        column: x => x.system_id,
                        principalSchema: "platform",
                        principalTable: "systems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_company_system_access_company_id",
                schema: "platform",
                table: "company_system_access",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_system_access_company_id_system_id",
                schema: "platform",
                table: "company_system_access",
                columns: new[] { "company_id", "system_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_company_system_access_system_id",
                schema: "platform",
                table: "company_system_access",
                column: "system_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_system_access",
                schema: "platform");
        }
    }
}
