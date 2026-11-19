using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdinsLibrary.Migrations
{
    public partial class addcoverUrlonbookmodel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Books",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Books");
        }
    }
}
