using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Company
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Address { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
