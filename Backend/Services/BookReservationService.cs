using AdinsLibrary.DTOs;
using AdinsLibrary.Exceptions;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class BookReservationService : IBookReservationService
    {
        private readonly IRepository<BookReservation> _reservationRepo;
        private readonly IRepository<Book> _bookRepo;
        private readonly IRepository<User> _userRepo;
        private readonly IRepository<Inventory> _inventoryRepo;

        public BookReservationService(
            IRepository<BookReservation> reservationRepo,
            IRepository<Book> bookRepo,
            IRepository<User> userRepo,
            IRepository<Inventory> inventoryRepo)
        {
            _reservationRepo = reservationRepo;
            _bookRepo = bookRepo;
            _userRepo = userRepo;
            _inventoryRepo = inventoryRepo;
        }

        public async Task<BookReservationResponse?> CreateAsync(
            CreateBookReservationRequest request, long userId)
        {
            Book? book = await _bookRepo.GetByIdAsync(request.BookId, nameof(Book.Author));
            if (book is null)
                return null;

            User? user = await _userRepo.GetByIdAsync(userId, nameof(User.MembershipTier));

            BookReservation reservation = new BookReservation
            {
                UserId = userId,
                BookId = request.BookId,
                ReservationDate = DateTime.UtcNow,
                BookReservationStatus = BookReservationStatus.ACTIVE,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepo.AddAsync(reservation);

            // Update 1 unit inventory yang tersedia untuk buku ini menjadi RESERVED
            var inventories = await _inventoryRepo.GetAllAsync();
            var availableUnit = inventories.FirstOrDefault(i =>
                i.BookId == request.BookId &&
                i.AvailabilityStatus == AvailabilityStatus.AVAILABLE);

            if (availableUnit is not null)
            {
                availableUnit.AvailabilityStatus = AvailabilityStatus.RESERVED;
                _inventoryRepo.Update(availableUnit);
            }

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
                BorrowDurationDays = user?.MembershipTier?.BorrowDurationDays,
                CreatedAt = reservation.CreatedAt
            };
        }

        public async Task<BookReservationResponse?> GetByIdAsync(long id)
        {
            BookReservation? r = await _reservationRepo.GetByIdAsync(id, nameof(BookReservation.User), $"{nameof(BookReservation.User)}.{nameof(User.MembershipTier)}", nameof(BookReservation.Book), "Book.Author");
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
                BorrowDurationDays = r.User?.MembershipTier?.BorrowDurationDays,
                CreatedAt = r.CreatedAt
            };
        }

        public async Task<List<BookReservationResponse>> GetMyReservationsAsync(long userId)
        {
            var reservations = await _reservationRepo.GetAllAsync(nameof(BookReservation.User), $"{nameof(BookReservation.User)}.{nameof(User.MembershipTier)}", nameof(BookReservation.Book), "Book.Author");
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
                    BorrowDurationDays = r.User?.MembershipTier?.BorrowDurationDays,
                    CreatedAt = r.CreatedAt
                });
            }

            return result;
        }

        public async Task<List<BookReservationResponse>> GetAllAsync(BookReservationStatus? status = null)
        {
            var reservations = await _reservationRepo.GetAllAsync(nameof(BookReservation.User), $"{nameof(BookReservation.User)}.{nameof(User.MembershipTier)}", nameof(BookReservation.Book), "Book.Author");
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
                    BorrowDurationDays = r.User?.MembershipTier?.BorrowDurationDays,
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

            // Kembalikan 1 unit inventory berstatus RESERVED untuk buku ini menjadi AVAILABLE
            var inventories = await _inventoryRepo.GetAllAsync();
            var reservedUnit = inventories.FirstOrDefault(i =>
                i.BookId == r.BookId &&
                i.AvailabilityStatus == AvailabilityStatus.RESERVED);

            if (reservedUnit is not null)
            {
                reservedUnit.AvailabilityStatus = AvailabilityStatus.AVAILABLE;
                _inventoryRepo.Update(reservedUnit);
            }

            await _reservationRepo.SaveChangesAsync();

            return true;
        }
    }
}