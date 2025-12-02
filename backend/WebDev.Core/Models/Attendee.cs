using System;

namespace WebDev.Core.Models;

public sealed class Attendee
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int UserId { get; set; }

    public Event? Event { get; set; } // EF reference
    public User? User { get; set; }   // EF reference
}
