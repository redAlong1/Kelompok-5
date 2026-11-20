using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IBookReservationService
    {
        Task<BookReservationResponse?> CreateAsync(CreateBookReservationRequest request, long userId);
        Task<BookReservationResponse?> GetByIdAsync(long id);
        Task<List<BookReservationResponse>> GetMyReservationsAsync(long userId);
        Task<bool> CancelAsync(long id, long userId);
    }
}
