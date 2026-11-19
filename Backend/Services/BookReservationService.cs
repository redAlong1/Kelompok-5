using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class BookReservationService : IBookReservationService
    {
        private readonly IRepository<BookReservation> _reservationRepo;
        private readonly IRepository<Book> _bookRepo;

        public BookReservationService(
            IRepository<BookReservation> reservationRepo,
            IRepository<Book> bookRepo)
        {
            _reservationRepo = reservationRepo;
            _bookRepo = bookRepo;
        }

        public async Task<BookReservationResponse?> CreateAsync(
            CreateBookReservationRequest request, long userId)
        {
            Book? book = await _bookRepo.GetByIdAsync(request.BookId);
            if (book is null)
                return null;

            BookReservation reservation = new BookReservation
            {
                UserId = userId,                                    // dari JWT
                BookId = request.BookId,
                ReservationDate = DateTime.UtcNow,
                BookReservationStatus = BookReservationStatus.ACTIVE,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepo.AddAsync(reservation);

            return new BookReservationResponse
            {
                BookReservationId = reservation.BookReservationId,
                UserId = reservation.UserId,
                UserName = string.Empty,                            // belum di-load
                BookId = reservation.BookId,
                BookTitle = book.Title,
                ReservationDate = reservation.ReservationDate,
                Status = reservation.BookReservationStatus.ToString(),
                CreatedAt = reservation.CreatedAt
            };
        }

        public async Task<BookReservationResponse?> GetByIdAsync(long id)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id);
            if (r is null)
                return null;

            return new BookReservationResponse
            {
                BookReservationId = r.BookReservationId,
                UserId = r.UserId,
                UserName = r.User?.Username ?? string.Empty,
                BookId = r.BookId,
                BookTitle = r.Book?.Title ?? string.Empty,
                ReservationDate = r.ReservationDate,
                Status = r.BookReservationStatus.ToString(),
                CreatedAt = r.CreatedAt
            };
        }

        public async Task<bool> CancelAsync(long id, long userId)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id);

            // Reservasi tidak ada
            if (r is null)
                return false;

            // Bukan milik user ini
            if (r.UserId != userId)
                return false;

            // Sudah tidak aktif
            if (r.BookReservationStatus != BookReservationStatus.ACTIVE)
                return false;

            // Ubah status
            r.BookReservationStatus = BookReservationStatus.CANCELLED;
            _reservationRepo.Update(r);             
            await _reservationRepo.SaveChangesAsync(); 

            return true;
        }
    }
}