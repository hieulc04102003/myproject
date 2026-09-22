using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ProductManagement.Infrastructure.Persistence;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(MyProjectContext))]
    [Migration("20260917000000_FixPaymentMethodConstraint")]
    public partial class FixPaymentMethodConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old constraint (created outside EF, may restrict to wrong values)
            migrationBuilder.Sql(
                "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;");

            // Normalize existing rows to match the allowed values
            migrationBuilder.Sql(
                "UPDATE orders SET payment_method = 'CASH' WHERE payment_method NOT IN ('CASH', 'BANK_TRANSFER');");

            // Add the correct constraint matching frontend values
            migrationBuilder.AddCheckConstraint(
                name: "orders_payment_method_check",
                table: "orders",
                sql: "payment_method IN ('CASH', 'BANK_TRANSFER')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "orders_payment_method_check",
                table: "orders");
        }
    }
}
