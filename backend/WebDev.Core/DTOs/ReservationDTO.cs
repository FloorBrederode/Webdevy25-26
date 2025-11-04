namespace WebDev.Core.DTOs
{
    public class ReservationDTO
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public int ParkingLotId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}