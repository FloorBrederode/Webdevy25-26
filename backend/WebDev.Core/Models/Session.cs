namespace WebDev.Core.Models
{
    public class Session
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public int ParkingLotId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int DurationMinutes { get; set; }

        public decimal? Price { get; set; }

        public string PaymentStatus { get; set; }


        // Navigation property
        public User User { get; set; }

        public ParkingLot ParkingLot { get; set; }
    }
}