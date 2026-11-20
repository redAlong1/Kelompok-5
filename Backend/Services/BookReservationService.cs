using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class BookReservationService : IBookReservationService
    {
        private readonly IRepository<BookReservation> _reservationRepo;
        private readonly IRepository<Book> _bookRepo;
        private readonly IRepository<User> _userRepo;

        public BookReservationService(
            IRepository<BookReservation> reservationRepo,
            IRepository<Book> bookRepo,
            IRepository<User> userRepo)
        {
            _reservationRepo = reservationRepo;
            _bookRepo = bookRepo;
            _userRepo = userRepo;
        }

        public async Task<BookReservationResponse?> CreateAsync(
            CreateBookReservationRequest request, long userId)
        {
            Book? book = await _bookRepo.GetByIdAsync(request.BookId, nameof(Book.Author));
            if (book is null)
                return null;

            User? user = await _userRepo.GetByIdAsync(userId);

            BookReservation reservation = new BookReservation
            {
                UserId = userId,
                BookId = request.BookId,
                ReservationDate = DateTime.UtcNow,
                BookReservationStatus = BookReservationStatus.ACTIVE,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepo.AddAsync(reservation);
            await _reservationRepo.SaveChangesAsync();

            var allReservations = await _reservationRepo.GetAllAsync();
            int queue = allReservations.Count(r => r.BookId == request.BookId && r.BookReservationStatus == BookReservationStatus.ACTIVE);

            return new BookReservationResponse
            {
                BookReservationId = reservation.BookReservationId,
                UserId = reservation.UserId,
                UserName = user?.Username ?? string.Empty,
                BookId = reservation.BookId,
                BookTitle = book.Title,
                AuthorName = book.Author?.AuthorName ?? string.Empty,
                CoverUrl = book.CoverUrl,
                ReservationDate = reservation.ReservationDate,
                Status = reservation.BookReservationStatus.ToString(),
                QueueNumber = queue > 0 ? queue : 1,
                CreatedAt = reservation.CreatedAt
            };
        }

        public async Task<BookReservationResponse?> GetByIdAsync(long id)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id, nameof(BookReservation.User), nameof(BookReservation.Book), "Book.Author");
            if (r is null)
                return null;

            var all = await _reservationRepo.GetAllAsync();
            int queue = all.Count(x => x.BookId == r.BookId && x.BookReservationStatus == BookReservationStatus.ACTIVE && x.CreatedAt <= r.CreatedAt);

            return new BookReservationResponse
            {
                BookReservationId = r.BookReservationId,
                UserId = r.UserId,
                UserName = r.User?.Username ?? string.Empty,
                BookId = r.BookId,
                BookTitle = r.Book?.Title ?? string.Empty,
                AuthorName = r.Book?.Author?.AuthorName ?? string.Empty,
                CoverUrl = r.Book?.CoverUrl,
                ReservationDate = r.ReservationDate,
                Status = r.BookReservationStatus.ToString(),
                QueueNumber = queue > 0 ? queue : 1,
                CreatedAt = r.CreatedAt
            };
        }

        public async Task<List<BookReservationResponse>> GetMyReservationsAsync(long userId)
        {
            var reservations = await _reservationRepo.GetAllAsync(nameof(BookReservation.User), nameof(BookReservation.Book), "Book.Author");
            var userReservations = reservations.Where(r => r.UserId == userId).OrderByDescending(r => r.CreatedAt).ToList();

            var result = new List<BookReservationResponse>();
            foreach (var r in userReservations)
            {
                int queue = 1;
                if (r.BookReservationStatus == BookReservationStatus.ACTIVE)
                {
                    queue = reservations.Count(x => x.BookId == r.BookId && x.BookReservationStatus == BookReservationStatus.ACTIVE && x.CreatedAt <= r.CreatedAt);
                }

                result.Add(new BookReservationResponse
                {
                    BookReservationId = r.BookReservationId,
                    UserId = r.UserId,
                    UserName = r.User?.Username ?? string.Empty,
                    BookId = r.BookId,
                    BookTitle = r.Book?.Title ?? string.Empty,
                    AuthorName = r.Book?.Author?.AuthorName ?? string.Empty,
                    CoverUrl = r.Book?.CoverUrl,
                    ReservationDate = r.ReservationDate,
                    Status = r.BookReservationStatus.ToString(),
                    QueueNumber = queue > 0 ? queue : 1,
                    CreatedAt = r.CreatedAt
                });
            }

            return result;
        }

        public async Task<List<BookReservationResponse>> GetAllAsync(BookReservationStatus? status = null)
        {
            var reservations = await _reservationRepo.GetAllAsync(nameof(BookReservation.User), nameof(BookReservation.Book), "Book.Author");
            var q = reservations.AsEnumerable();
            if (status.HasValue)
            {
                q = q.Where(r => r.BookReservationStatus == status.Value);
            }

            var list = q.OrderBy(r => r.CreatedAt).ToList();
            var result = new List<BookReservationResponse>();

            foreach (var r in list)
            {
                int queue = 1;
                if (r.BookReservationStatus == BookReservationStatus.ACTIVE)
                {
                    queue = reservations.Count(x => x.BookId == r.BookId && x.BookReservationStatus == BookReservationStatus.ACTIVE && x.CreatedAt <= r.CreatedAt);
                }

                result.Add(new BookReservationResponse
                {
                    BookReservationId = r.BookReservationId,
                    UserId = r.UserId,
                    UserName = r.User?.Username ?? string.Empty,
                    BookId = r.BookId,
                    BookTitle = r.Book?.Title ?? string.Empty,
                    AuthorName = r.Book?.Author?.AuthorName ?? string.Empty,
                    CoverUrl = r.Book?.CoverUrl,
                    ReservationDate = r.ReservationDate,
                    Status = r.BookReservationStatus.ToString(),
                    QueueNumber = queue > 0 ? queue : 1,
                    CreatedAt = r.CreatedAt
                });
            }

            return result;
        }

        public async Task<bool> CompleteAsync(long id)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id);

            if (r is null)
                return false;

            r.BookReservationStatus = BookReservationStatus.COMPLETE;
            _reservationRepo.Update(r);
            await _reservationRepo.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CancelAsync(long id, long userId)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id);

            if (r is null)
                return false;

            if (r.UserId != userId)
                return false;

            if (r.BookReservationStatus != BookReservationStatus.ACTIVE)
                return false;

            r.BookReservationStatus = BookReservationStatus.CANCELLED;
            _reservationRepo.Update(r);
            await _reservationRepo.SaveChangesAsync();

            return true;
        }
    }
}
