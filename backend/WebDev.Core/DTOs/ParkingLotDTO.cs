namespace WebDev.Core.DTOs
{
    public class ParkingLotDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public decimal HourlyRate { get; set; }
    }
}