using System;
using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Team
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public List<Guid> Members { get; set; } = new();
}
