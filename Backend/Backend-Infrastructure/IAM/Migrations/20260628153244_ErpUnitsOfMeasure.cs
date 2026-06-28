using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class ErpUnitsOfMeasure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "erp");

            migrationBuilder.CreateTable(
                name: "units_of_measure",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    abbreviation = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_units_of_measure", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_units_of_measure_company_id",
                schema: "erp",
                table: "units_of_measure",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_units_of_measure_company_id_name",
                schema: "erp",
                table: "units_of_measure",
                columns: new[] { "company_id", "name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "units_of_measure",
                schema: "erp");
        }
    }
}
