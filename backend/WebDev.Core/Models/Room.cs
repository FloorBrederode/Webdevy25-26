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

public sealed class RoomOpeningSlot : IEquatable<RoomOpeningSlot>
{
    public DayOfWeek Day { get; set; }
    public TimeSpan OpensAt { get; set; }
    public TimeSpan ClosesAt { get; set; }

    public RoomOpeningSlot Clone() => new()
    {
        Day = Day,
        OpensAt = OpensAt,
        ClosesAt = ClosesAt
    };

    public bool Equals(RoomOpeningSlot? other) =>
        other is not null &&
        Day == other.Day &&
        OpensAt == other.OpensAt &&
        ClosesAt == other.ClosesAt;

    public override bool Equals(object? obj) => obj is RoomOpeningSlot other && Equals(other);

    public override int GetHashCode() => HashCode.Combine((int)Day, OpensAt, ClosesAt);
}

