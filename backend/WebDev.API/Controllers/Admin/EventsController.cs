using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;

namespace WebDev.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=../Database/db.sqlite";

        [HttpGet("upcoming")]
        public IActionResult GetUpcomingEvents([FromQuery] int userId)
        {
            var events = new List<object>();

            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                SELECT *
                FROM event
                WHERE start_time >= datetime('now')
                  AND (organizer_id = $userId
                       OR EXISTS (
                           SELECT 1
                           FROM json_each(attendee_ids)
                           WHERE json_each.value = $userId
                       ))
                ORDER BY start_time ASC
            ";
            cmd.Parameters.AddWithValue("$userId", userId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                events.Add(new
                {
                    id = reader.GetInt32(reader.GetOrdinal("id")),
                    name = reader.GetString(reader.GetOrdinal("name")),
                    description = reader.GetString(reader.GetOrdinal("description")),
                    start_time = reader.GetString(reader.GetOrdinal("start_time")),
                    end_time = reader.GetString(reader.GetOrdinal("end_time")),
                    organizer_id = reader.GetInt32(reader.GetOrdinal("organizer_id"))
                });
            }

            return Ok(events);
        }
    }
}
