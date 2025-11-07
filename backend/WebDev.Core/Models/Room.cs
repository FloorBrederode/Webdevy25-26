namespace WebDev.Core.Models;

public sealed class Room
{
    public int Id { get; set; }
    public int? Capacity { get; set; }
    public string? Location { get; set; }
    public int CompanyId { get; set; }
    public Company? Company { get; set; }
}
