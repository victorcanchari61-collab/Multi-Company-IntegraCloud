using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddStockCostAndLevels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "max_stock",
                schema: "erp",
                table: "stock",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "min_stock",
                schema: "erp",
                table: "stock",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "unit_cost",
                schema: "erp",
                table: "stock",
                type: "numeric(18,6)",
                precision: 18,
                scale: 6,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "max_stock",
                schema: "erp",
                table: "stock");

            migrationBuilder.DropColumn(
                name: "min_stock",
                schema: "erp",
                table: "stock");

            migrationBuilder.DropColumn(
                name: "unit_cost",
                schema: "erp",
                table: "stock");
        }
    }
}
