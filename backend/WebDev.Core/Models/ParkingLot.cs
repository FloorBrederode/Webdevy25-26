using System;
using System.Text.Json.Serialization;

namespace WebDev.Core.Models
{
    public class ParkingLot
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Location { get; set; }

        public string Address { get; set; }

        public int Capacity { get; set; }

        public int Reserved { get; set; }

        public float Tariff { get; set; }

        public float DayTariff { get; set; }

        public DateTime CreatedAt { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [JsonIgnore]
        public object Coordinates => new { lat = Latitude, lng = Longitude };


        // Navigation properties
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Session> Sessions { get; set; } = new List<Session>();
    }
}