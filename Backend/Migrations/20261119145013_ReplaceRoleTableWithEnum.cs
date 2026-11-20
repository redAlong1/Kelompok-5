using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AdinsLibrary.Migrations
{
    public partial class ReplaceRoleTableWithEnum : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Tambah kolom Role baru dulu (default 'User')
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "User");

            // 2. Salin data: user yang tadinya berrole Admin jadi 'Admin'
            migrationBuilder.Sql(@"
                UPDATE ""Users"" u
                SET ""Role"" = 'Admin'
                FROM ""Roles"" r
                WHERE u.""RoleId"" = r.""RoleId"" AND r.""RoleName"" = 'Admin';
            ");

            // 3. Baru hapus yang lama
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Buat ulang tabel Roles
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RoleName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleName",
                table: "Roles",
                column: "RoleName",
                unique: true);

            // 2. Isi data role
            migrationBuilder.Sql(@"
                INSERT INTO ""Roles"" (""RoleName"", ""CreatedAt"")
                VALUES ('Admin', NOW()), ('User', NOW());
            ");

            // 3. Tambah RoleId (sementara nullable agar bisa diisi dulu)
            migrationBuilder.AddColumn<long>(
                name: "RoleId",
                table: "Users",
                type: "bigint",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Users"" u
                SET ""RoleId"" = r.""RoleId""
                FROM ""Roles"" r
                WHERE r.""RoleName"" = u.""Role"";
            ");

            migrationBuilder.AlterColumn<long>(
                name: "RoleId",
                table: "Users",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            // 4. Pasang kembali index dan foreign key, lalu hapus kolom Role
            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "RoleId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}