using System;
using System.Collections.Generic;

namespace WebDev.Core.Models;

public sealed class Room
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public List<RoomOpeningSlot> OpeningTimes { get; set; } = new();
    public int Capacity { get; set; }
}
