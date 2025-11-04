namespace WebDev.Core.Models;

public sealed class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Location { get; set; }
    public int Attendees { get; set; }
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public TimeSpan Duration { get; set; }
    public string? Organizer { get; set; }
}
