using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace WebDev.Core.Models
{

    public class User
    {
        public Guid ID { get; set; } = Guid.NewGuid();
        public required string IdentityUserId { get; set; }
        public required IdentityUser IdentityUser { get; set; }

        public required string Username { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public required DateTime BirthDate { get; set; }
        public required bool IsActive { get; set; } = true;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public ICollection<Session> Sessions { get; set; } = new List<Session>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}