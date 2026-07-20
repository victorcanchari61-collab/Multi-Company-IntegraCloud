using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddRestrictions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "role_restrictions",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    restricted_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    effect = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "deny"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_restrictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_role_restrictions_roles_role_id",
                        column: x => x.role_id,
                        principalSchema: "iam",
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_restrictions",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    restricted_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    effect = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "deny"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_restrictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_restrictions_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "iam",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_role_restrictions_role_id_restricted_key",
                schema: "iam",
                table: "role_restrictions",
                columns: new[] { "role_id", "restricted_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_restrictions_user_id_restricted_key",
                schema: "iam",
                table: "user_restrictions",
                columns: new[] { "user_id", "restricted_key" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "role_restrictions",
                schema: "iam");

            migrationBuilder.DropTable(
                name: "user_restrictions",
                schema: "iam");
        }
    }
}
