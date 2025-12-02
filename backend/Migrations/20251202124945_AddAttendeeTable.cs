using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDev.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendeeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "attendee_ids",
                table: "event");

            migrationBuilder.CreateTable(
                name: "attendee",
                columns: table => new
                {
                    attendence_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    event_id = table.Column<int>(type: "INTEGER", nullable: false),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attendee", x => x.attendence_id);
                    table.ForeignKey(
                        name: "FK_attendee_event_event_id",
                        column: x => x.event_id,
                        principalTable: "event",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_attendee_user_user_id",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_attendee_event",
                table: "attendee",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "idx_attendee_user",
                table: "attendee",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attendee");

            migrationBuilder.AddColumn<string>(
                name: "attendee_ids",
                table: "event",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
