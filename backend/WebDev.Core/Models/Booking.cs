using System;
using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Location { get; set; }
    public List<Guid> Attendees { get; set; } = new();
    public DateTime StartTime { get; set; }
    public TimeSpan Duration { get; set; }
}
