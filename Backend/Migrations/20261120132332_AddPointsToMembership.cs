using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdinsLibrary.Migrations
{
    public partial class AddPointsToMembership : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BorrowDurationDays",
                table: "MembershipTiers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxBorrowItems",
                table: "MembershipTiers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinPoints",
                table: "MembershipTiers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Points",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BorrowDurationDays",
                table: "MembershipTiers");

            migrationBuilder.DropColumn(
                name: "MaxBorrowItems",
                table: "MembershipTiers");

            migrationBuilder.DropColumn(
                name: "MinPoints",
                table: "MembershipTiers");
        }
    }
}
