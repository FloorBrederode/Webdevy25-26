using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Team
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int? LeadId { get; set; }
    public User? Lead { get; set; }
    public List<int> MemberIds { get; set; } = new();
}
