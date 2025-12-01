using System;
using System.ComponentModel.DataAnnotations;

namespace WebDev.Core.DTOs;

public sealed class RoomAvailabilityRequestDto
{
    [Required]
    public DateTime StartTime { get; init; }

    [Required]
    public DateTime EndTime { get; init; }
}
