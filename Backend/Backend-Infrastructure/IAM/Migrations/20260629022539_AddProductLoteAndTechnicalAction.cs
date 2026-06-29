using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddProductLoteAndTechnicalAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "lote_expiry",
                schema: "erp",
                table: "products",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "lote_number",
                schema: "erp",
                table: "products",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "lote_stock",
                schema: "erp",
                table: "products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "lote_stock_fraction",
                schema: "erp",
                table: "products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "technical_action",
                schema: "erp",
                table: "products",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "lote_expiry",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "lote_number",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "lote_stock",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "lote_stock_fraction",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "technical_action",
                schema: "erp",
                table: "products");
        }
    }
}
