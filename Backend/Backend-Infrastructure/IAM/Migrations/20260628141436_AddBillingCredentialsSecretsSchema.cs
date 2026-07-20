using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingCredentialsSecretsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "secrets");

            migrationBuilder.CreateTable(
                name: "company_billing_credentials",
                schema: "secrets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sol_user = table.Column<string>(type: "text", nullable: true),
                    sol_password = table.Column<string>(type: "text", nullable: true),
                    certificate_content = table.Column<string>(type: "text", nullable: true),
                    certificate_password = table.Column<string>(type: "text", nullable: true),
                    certificate_file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_billing_credentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_billing_credentials_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "platform",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_company_billing_credentials_company_id",
                schema: "secrets",
                table: "company_billing_credentials",
                column: "company_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_billing_credentials",
                schema: "secrets");
        }
    }
}
