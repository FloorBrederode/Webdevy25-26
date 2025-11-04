namespace WebDev.Core.Models
{
    public class Vehicle
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public string LicensePlate { get; set; }

        public string Make { get; set; }

        public string Model { get; set; }

        public string Color { get; set; }

        public int Year { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation property
        public User User { get; set; }
    }
}