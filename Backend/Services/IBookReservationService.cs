using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IBookReservationService
    {
        Task<List<BookReservationResponse>> GetAllAsync(BookReservationStatus? status = null);
        Task<BookReservationResponse?> CreateAsync(CreateBookReservationRequest request, long userId);
        Task<BookReservationResponse?> GetByIdAsync(long id);
        Task<List<BookReservationResponse>> GetMyReservationsAsync(long userId);
        Task<bool> CancelAsync(long id, long userId);
        Task<bool> CompleteAsync(long id);
    }
}
