using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ProductManagement.Infrastructure.Persistence;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(MyProjectContext))]
    [Migration("20260917000001_AddProductStockQuantity")]
    public partial class AddProductStockQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "stock_quantity",
                table: "products");
        }
    }
}
