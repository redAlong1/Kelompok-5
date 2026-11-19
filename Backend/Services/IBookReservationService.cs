using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IBookReservationService
    {
        Task<BookReservationResponse?> CreateAsync(CreateBookReservationRequest request, long userId);
        Task<BookReservationResponse?> GetByIdAsync(long id);
        Task<bool> CancelAsync(long id, long userId); // userId diambil dr JWT
    }
}
