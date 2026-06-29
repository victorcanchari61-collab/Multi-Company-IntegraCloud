using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddComplementFieldsToProductPresentation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "complementary_product_id",
                schema: "erp",
                table: "product_presentations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "complementary_quantity",
                schema: "erp",
                table: "product_presentations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "markup_percentage",
                schema: "erp",
                table: "product_presentations",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_product_presentations_complementary_product_id",
                schema: "erp",
                table: "product_presentations",
                column: "complementary_product_id");

            migrationBuilder.AddForeignKey(
                name: "FK_product_presentations_products_complementary_product_id",
                schema: "erp",
                table: "product_presentations",
                column: "complementary_product_id",
                principalSchema: "erp",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_presentations_products_complementary_product_id",
                schema: "erp",
                table: "product_presentations");

            migrationBuilder.DropIndex(
                name: "IX_product_presentations_complementary_product_id",
                schema: "erp",
                table: "product_presentations");

            migrationBuilder.DropColumn(
                name: "complementary_product_id",
                schema: "erp",
                table: "product_presentations");

            migrationBuilder.DropColumn(
                name: "complementary_quantity",
                schema: "erp",
                table: "product_presentations");

            migrationBuilder.DropColumn(
                name: "markup_percentage",
                schema: "erp",
                table: "product_presentations");
        }
    }
}
