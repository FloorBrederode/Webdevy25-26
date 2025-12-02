using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;



namespace WebDev.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]

public class AdminController : ControllerBase
{
    private readonly string _connectionString = "Data Source=../Database/db.sqlite";

    // Admin-specific endpoints can be added here

    [HttpGet("AllUsers")]
    public ActionResult<List<string>> GetAllUsers()
    {
        var users = new List<string>();

        using (var connection = new SqliteConnection(_connectionString))
        {
            connection.Open();

            var command = connection.CreateCommand();
            command.CommandText = "SELECT Email FROM Users";

            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    users.Add(reader.GetString(0));
                }
            }
        }

        return Ok(users);
    }

}