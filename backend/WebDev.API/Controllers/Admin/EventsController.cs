using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace WebDev.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<EventsController> _logger;

        public EventsController(IWebHostEnvironment env, ILogger<EventsController> logger)
        {
            _logger = logger;
            var databasePath = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "Database", "database.db"));
            _connectionString = $"Data Source={databasePath}";
            _logger.LogInformation($"Using database at: {databasePath}");
        }

        public record CreateEventDto(
            string Name,
            string? Description,
            string StartTime,
            string EndTime,
            int? OrganizerId,
            int[]? RoomIds,
            int[]? AttendeeIds
        );

        public record EventDto(
            int Id,
            string Name,
            string? Description,
            string StartTime,
            string EndTime,
            int? OrganizerId,
            string AttendeeIds,
            string RoomIds
        );

        [HttpPost]
        public IActionResult CreateEvent([FromBody] CreateEventDto dto)
        {
            if (dto is null)
            {
                _logger.LogWarning("CreateEvent called with null body");
                return BadRequest("Request body is required.");
            }

            // Validate inputs
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                _logger.LogWarning("CreateEvent called with empty name");
                return BadRequest("Name is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.StartTime) || string.IsNullOrWhiteSpace(dto.EndTime))
            {
                _logger.LogWarning("CreateEvent called with missing times");
                return BadRequest("StartTime and EndTime are required.");
            }

            // Parse and validate times
            if (!DateTime.TryParse(dto.StartTime, out var startTime) || !DateTime.TryParse(dto.EndTime, out var endTime))
            {
                _logger.LogWarning($"CreateEvent called with invalid dates: {dto.StartTime}, {dto.EndTime}");
                return BadRequest("Invalid date/time format.");
            }

            if (startTime >= endTime)
            {
                _logger.LogWarning($"CreateEvent called with start >= end: {startTime} >= {endTime}");
                return BadRequest("StartTime must be before EndTime.");
            }

            if ((dto.RoomIds?.Length ?? 0) == 0)
            {
                _logger.LogWarning("CreateEvent called with no room IDs");
                return BadRequest("At least one room ID is required.");
            }

            try
            {
                using var connection = new SqliteConnection(_connectionString);
                connection.Open();
                _logger.LogInformation("Database connection opened");

                using var cmd = connection.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO event (name, description, start_time, end_time, organizer_id, attendee_ids, room_ids)
                    VALUES ($name, $description, $start_time, $end_time, $organizer_id, $attendee_ids, $room_ids);
                    SELECT last_insert_rowid();
                ";

                cmd.Parameters.AddWithValue("$name", dto.Name);
                cmd.Parameters.AddWithValue("$description", dto.Description ?? string.Empty);
                cmd.Parameters.AddWithValue("$start_time", dto.StartTime);
                cmd.Parameters.AddWithValue("$end_time", dto.EndTime);
                
                if (dto.OrganizerId.HasValue)
                    cmd.Parameters.AddWithValue("$organizer_id", dto.OrganizerId.Value);
                else
                    cmd.Parameters.AddWithValue("$organizer_id", DBNull.Value);

                var attendeeJson = JsonSerializer.Serialize(dto.AttendeeIds ?? Array.Empty<int>());
                var roomJson = JsonSerializer.Serialize(dto.RoomIds ?? Array.Empty<int>());
                cmd.Parameters.AddWithValue("$attendee_ids", attendeeJson);
                cmd.Parameters.AddWithValue("$room_ids", roomJson);

                _logger.LogInformation($"Inserting event: {dto.Name}, times: {dto.StartTime} to {dto.EndTime}, rooms: {roomJson}");

                var inserted = cmd.ExecuteScalar();
                var id = inserted is long l ? (int)l : Convert.ToInt32(inserted);

                _logger.LogInformation($"Event created with ID: {id}");

                return CreatedAtAction(nameof(GetEventById), new { id }, new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error while creating event");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Database error: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public IActionResult GetEventById(int id)
        {
            try
            {
                using var connection = new SqliteConnection(_connectionString);
                connection.Open();

                using var cmd = connection.CreateCommand();
                cmd.CommandText = @"
                    SELECT id, name, description, start_time, end_time, organizer_id, attendee_ids, room_ids
                    FROM event
                    WHERE id = $id
                ";
                cmd.Parameters.AddWithValue("$id", id);

                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return Ok(new EventDto(
                        reader.GetInt32(reader.GetOrdinal("id")),
                        reader.GetString(reader.GetOrdinal("name")),
                        reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        reader.GetString(reader.GetOrdinal("start_time")),
                        reader.GetString(reader.GetOrdinal("end_time")),
                        reader.IsDBNull(reader.GetOrdinal("organizer_id")) ? null : reader.GetInt32(reader.GetOrdinal("organizer_id")),
                        reader.IsDBNull(reader.GetOrdinal("attendee_ids")) ? "[]" : reader.GetString(reader.GetOrdinal("attendee_ids")),
                        reader.GetString(reader.GetOrdinal("room_ids"))
                    ));
                }

                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching event");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Database error: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult GetAllEvents()
        {
            try
            {
                var events = new List<EventDto>();

                using var connection = new SqliteConnection(_connectionString);
                connection.Open();

                using var cmd = connection.CreateCommand();
                cmd.CommandText = @"
                    SELECT id, name, description, start_time, end_time, organizer_id, attendee_ids, room_ids
                    FROM event
                    ORDER BY start_time ASC
                ";

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    events.Add(new EventDto(
                        reader.GetInt32(reader.GetOrdinal("id")),
                        reader.GetString(reader.GetOrdinal("name")),
                        reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                        reader.GetString(reader.GetOrdinal("start_time")),
                        reader.GetString(reader.GetOrdinal("end_time")),
                        reader.IsDBNull(reader.GetOrdinal("organizer_id")) ? null : reader.GetInt32(reader.GetOrdinal("organizer_id")),
                        reader.IsDBNull(reader.GetOrdinal("attendee_ids")) ? "[]" : reader.GetString(reader.GetOrdinal("attendee_ids")),
                        reader.GetString(reader.GetOrdinal("room_ids"))
                    ));
                }

                _logger.LogInformation($"Fetched {events.Count} events from database");
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching events");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Database error: {ex.Message}");
            }
        }

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

