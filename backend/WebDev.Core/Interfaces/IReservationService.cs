using WebDev.Core.Models;

namespace WebDev.Core.Interfaces;
public interface IReservationService
{
    Task<IEnumerable<Reservation>> GetAllReservationsAsync();
}