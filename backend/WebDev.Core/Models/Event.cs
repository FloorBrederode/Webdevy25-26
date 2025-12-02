using System;
using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Event
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? OrganizerId { get; set; }
    public User? Organizer { get; set; } //EF ref
    public List<int> RoomIds { get; set; } = new();
    public List<Attendee> Attendees { get; set; } = new();
}
