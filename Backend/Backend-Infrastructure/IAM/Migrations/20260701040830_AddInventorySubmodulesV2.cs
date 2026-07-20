using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddInventorySubmodulesV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "locations",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    zone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_locations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_locations_locations_parent_id",
                        column: x => x.parent_id,
                        principalSchema: "erp",
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_locations_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "physical_counts",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "DRAFT"),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_physical_counts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_physical_counts_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_reservations",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    reference_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE"),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    released_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stock_reservations_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_stock_reservations_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "serial_numbers",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    batch_id = table.Column<Guid>(type: "uuid", nullable: true),
                    serial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "IN_STOCK"),
                    warehouse_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_serial_numbers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_serial_numbers_locations_location_id",
                        column: x => x.location_id,
                        principalSchema: "erp",
                        principalTable: "locations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_serial_numbers_product_lots_batch_id",
                        column: x => x.batch_id,
                        principalSchema: "erp",
                        principalTable: "product_lots",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_serial_numbers_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_serial_numbers_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "erp",
                        principalTable: "warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "physical_count_lines",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    physical_count_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    expected_quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    counted_quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDING")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_physical_count_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_physical_count_lines_physical_counts_physical_count_id",
                        column: x => x.physical_count_id,
                        principalSchema: "erp",
                        principalTable: "physical_counts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_physical_count_lines_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_locations_parent_id",
                schema: "erp",
                table: "locations",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_locations_warehouse_id_code",
                schema: "erp",
                table: "locations",
                columns: new[] { "warehouse_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_physical_count_lines_physical_count_id",
                schema: "erp",
                table: "physical_count_lines",
                column: "physical_count_id");

            migrationBuilder.CreateIndex(
                name: "IX_physical_count_lines_product_id",
                schema: "erp",
                table: "physical_count_lines",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_physical_counts_warehouse_id",
                schema: "erp",
                table: "physical_counts",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_serial_numbers_batch_id",
                schema: "erp",
                table: "serial_numbers",
                column: "batch_id");

            migrationBuilder.CreateIndex(
                name: "IX_serial_numbers_company_id_serial",
                schema: "erp",
                table: "serial_numbers",
                columns: new[] { "company_id", "serial" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_serial_numbers_location_id",
                schema: "erp",
                table: "serial_numbers",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_serial_numbers_product_id",
                schema: "erp",
                table: "serial_numbers",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_serial_numbers_warehouse_id",
                schema: "erp",
                table: "serial_numbers",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_company_id_status",
                schema: "erp",
                table: "stock_reservations",
                columns: new[] { "company_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_product_id",
                schema: "erp",
                table: "stock_reservations",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_reference_type_reference_id",
                schema: "erp",
                table: "stock_reservations",
                columns: new[] { "reference_type", "reference_id" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_warehouse_id",
                schema: "erp",
                table: "stock_reservations",
                column: "warehouse_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "physical_count_lines",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "serial_numbers",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "stock_reservations",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "physical_counts",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "locations",
                schema: "erp");
        }
    }
}
