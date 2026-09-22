using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ProductManagement.Infrastructure.Persistence;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    public partial class AddOtpsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS otps (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    phone_number VARCHAR(20) NOT NULL,
                    otp_code VARCHAR(10) NOT NULL,
                    is_used BOOLEAN NOT NULL DEFAULT FALSE,
                    attempts_count INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_otps_phone_lookup ON otps(phone_number, is_used, expires_at);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP TABLE IF EXISTS otps;
            ");
        }
    }
}
