using WebDev.Core.Models;

namespace WebDev.Core.Interfaces;
public interface IVehicleService
{
    Task<IEnumerable<Vehicle>> GetAllVehiclesAsync();
}