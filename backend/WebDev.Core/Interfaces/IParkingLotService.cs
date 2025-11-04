using WebDev.Core.Models;


namespace WebDev.Core.Interfaces;
public interface IParkingLotService
{
    Task<IEnumerable<ParkingLot>> GetAllParkingLotsAsync();
}