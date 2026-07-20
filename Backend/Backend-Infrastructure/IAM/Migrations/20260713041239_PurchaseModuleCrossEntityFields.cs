using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class PurchaseModuleCrossEntityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                schema: "erp",
                table: "supplier_evaluations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                schema: "erp",
                table: "purchase_requests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                schema: "erp",
                table: "purchase_requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityReceived",
                schema: "erp",
                table: "purchase_order_items",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_supplier_evaluations_OrderId",
                schema: "erp",
                table: "supplier_evaluations",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_requests_SupplierId",
                schema: "erp",
                table: "purchase_requests",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_requests_suppliers_SupplierId",
                schema: "erp",
                table: "purchase_requests",
                column: "SupplierId",
                principalSchema: "erp",
                principalTable: "suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_supplier_evaluations_purchase_orders_OrderId",
                schema: "erp",
                table: "supplier_evaluations",
                column: "OrderId",
                principalSchema: "erp",
                principalTable: "purchase_orders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_purchase_requests_suppliers_SupplierId",
                schema: "erp",
                table: "purchase_requests");

            migrationBuilder.DropForeignKey(
                name: "FK_supplier_evaluations_purchase_orders_OrderId",
                schema: "erp",
                table: "supplier_evaluations");

            migrationBuilder.DropIndex(
                name: "IX_supplier_evaluations_OrderId",
                schema: "erp",
                table: "supplier_evaluations");

            migrationBuilder.DropIndex(
                name: "IX_purchase_requests_SupplierId",
                schema: "erp",
                table: "purchase_requests");

            migrationBuilder.DropColumn(
                name: "OrderId",
                schema: "erp",
                table: "supplier_evaluations");

            migrationBuilder.DropColumn(
                name: "Priority",
                schema: "erp",
                table: "purchase_requests");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                schema: "erp",
                table: "purchase_requests");

            migrationBuilder.DropColumn(
                name: "QuantityReceived",
                schema: "erp",
                table: "purchase_order_items");
        }
    }
}
