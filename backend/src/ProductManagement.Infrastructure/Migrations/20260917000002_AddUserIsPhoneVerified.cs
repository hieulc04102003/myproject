using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ProductManagement.Infrastructure.Persistence;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(MyProjectContext))]
    [Migration("20260917000002_AddUserIsPhoneVerified")]
    public partial class AddUserIsPhoneVerified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified boolean NOT NULL DEFAULT true;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_phone_verified",
                table: "users");
        }
    }
}
