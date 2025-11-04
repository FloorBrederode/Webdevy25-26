namespace WebDev.Core.Models;

public sealed class Room
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public string? OpeningTimes { get; set; }
    public int Capacity { get; set; }
}
