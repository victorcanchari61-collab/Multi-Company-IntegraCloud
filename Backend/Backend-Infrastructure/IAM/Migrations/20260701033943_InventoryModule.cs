using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class InventoryModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "warehouses",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    location = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "kardex_entries",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    movement_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reference_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quantity_in = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    quantity_out = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    previous_balance = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    total_cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kardex_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_kardex_entries_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_kardex_entries_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    reserved_quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_movements",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_warehouse_id = table.Column<Guid>(type: "uuid", nullable: true),
                    movement_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    reference_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_movements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_movements_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_movements_warehouses_target_warehouse_id",
                        column: x => x.target_warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_stock_movements_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transfers",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    to_warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "PENDING"),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transfers_warehouses_from_warehouse_id",
                        column: x => x.from_warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transfers_warehouses_to_warehouse_id",
                        column: x => x.to_warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transfer_items",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    transfer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfer_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transfer_items_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transfer_items_transfers_transfer_id",
                        column: x => x.transfer_id,
                        principalSchema: "erp",
                        principalTable: "transfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_kardex_entries_company_id_product_id_warehouse_id",
                schema: "erp",
                table: "kardex_entries",
                columns: new[] { "company_id", "product_id", "warehouse_id" });

            migrationBuilder.CreateIndex(
                name: "IX_kardex_entries_created_at",
                schema: "erp",
                table: "kardex_entries",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_kardex_entries_product_id",
                schema: "erp",
                table: "kardex_entries",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_kardex_entries_warehouse_id",
                schema: "erp",
                table: "kardex_entries",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_company_id",
                schema: "erp",
                table: "stock",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_company_id_product_id_warehouse_id",
                schema: "erp",
                table: "stock",
                columns: new[] { "company_id", "product_id", "warehouse_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_product_id",
                schema: "erp",
                table: "stock",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_warehouse_id",
                schema: "erp",
                table: "stock",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_company_id",
                schema: "erp",
                table: "stock_movements",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_created_at",
                schema: "erp",
                table: "stock_movements",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_product_id",
                schema: "erp",
                table: "stock_movements",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_target_warehouse_id",
                schema: "erp",
                table: "stock_movements",
                column: "target_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_warehouse_id",
                schema: "erp",
                table: "stock_movements",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_product_id",
                schema: "erp",
                table: "transfer_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_items_transfer_id",
                schema: "erp",
                table: "transfer_items",
                column: "transfer_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_company_id",
                schema: "erp",
                table: "transfers",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_from_warehouse_id",
                schema: "erp",
                table: "transfers",
                column: "from_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_status",
                schema: "erp",
                table: "transfers",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_transfers_to_warehouse_id",
                schema: "erp",
                table: "transfers",
                column: "to_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_warehouses_company_id",
                schema: "erp",
                table: "warehouses",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_warehouses_company_id_code",
                schema: "erp",
                table: "warehouses",
                columns: new[] { "company_id", "code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "kardex_entries",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "stock",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "stock_movements",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "transfer_items",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "transfers",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "warehouses",
                schema: "erp");
        }
    }
}
