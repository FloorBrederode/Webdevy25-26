using System;

namespace WebDev.Core.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public int ParkingLotId { get; set; }

        public int VehicleId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public decimal Cost { get; set; }


        // Navigation properties
        public User User { get; set; }

        public ParkingLot ParkingLot { get; set; }

        public Vehicle Vehicle { get; set; }

        public Payment Payment { get; set; }
    }
}
