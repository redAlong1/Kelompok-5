using AdinsLibrary.Data;
using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace AdinsLibrary.Services
{
    public class BookBorrowingTransactionService : IBookBorrowingTransactionService
    {
        private readonly AdInsLibraryDbContext _db;
        private readonly IFineService _fineService;
        private readonly IConfiguration _config;

        public BookBorrowingTransactionService(
            AdInsLibraryDbContext db,
            IFineService fineService,
            IConfiguration config)
        {
            _db = db;
            _fineService = fineService;
            _config = config;
        }

        // ---------- PINJAM ----------
        public async Task<(BorrowingResponse? Result, string? Error)> BorrowAsync(BorrowRequest request)
        {
            var inventoryIds = request.InventoryIds.Distinct().ToList();
            int maxItems = _config.GetValue("Borrowing:MaxItems", 3);
            int durationDays = _config.GetValue("Borrowing:DurationDays", 14);

            if (inventoryIds.Count == 0)
                return (null, "Pilih minimal satu buku");
            if (inventoryIds.Count > maxItems)
                return (null, $"Maksimal {maxItems} buku per peminjaman");

            var user = await _db.Users.FindAsync(request.UserId);
            if (user == null)
                return (null, "User tidak ditemukan");

            if (await _fineService.HasUnpaidFinesAsync(user.UserId))
                return (null, "User masih memiliki denda yang belum dibayar");

            var inventories = await _db.Inventories
                .Include(i => i.Book)
                .Where(i => inventoryIds.Contains(i.InventoryId))
                .ToListAsync();

            if (inventories.Count != inventoryIds.Count)
                return (null, "Ada salinan buku yang tidak ditemukan");

            var unavailable = inventories.FirstOrDefault(i => i.AvailabilityStatus != AvailabilityStatus.AVAILABLE);
            if (unavailable != null)
                return (null, $"Buku '{unavailable.Book?.Title}' sedang tidak tersedia");

            await using var tx = await _db.Database.BeginTransactionAsync();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var transaction = new BookBorrowingTransaction
            {
                UserId = user.UserId,
                BookTransactionStatus = BookBorrowingTransactionStatus.BORROWED,
                BorrowDate = today,
                DueDate = today.AddDays(durationDays),
                CreatedAt = DateTime.UtcNow
            };

            foreach (var inv in inventories)
            {
                transaction.BorrowingItems.Add(new BorrowingItem { InventoryId = inv.InventoryId });
                inv.AvailabilityStatus = AvailabilityStatus.BORROWED;
            }

            _db.BookBorrowingTransactions.Add(transaction);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(transaction.BookBorrowingTransactionId), null);
        }

        // ---------- KEMBALI ----------
        public async Task<(ReturnResultResponse? Result, string? Error)> ReturnAsync(long transactionId, ReturnRequest request)
        {
            if (request.Items.Count == 0)
                return (null, "Pilih minimal satu buku yang dikembalikan");
            if (request.Items.Select(i => i.BorrowingItemId).Distinct().Count() != request.Items.Count)
                return (null, "Ada buku yang dikirim dua kali");

            var transaction = await _db.BookBorrowingTransactions
                .Include(t => t.BorrowingItems).ThenInclude(i => i.Inventory)
                .FirstOrDefaultAsync(t => t.BookBorrowingTransactionId == transactionId);

            if (transaction == null)
                return (null, "Transaksi tidak ditemukan");
            if (transaction.BookTransactionStatus == BookBorrowingTransactionStatus.RETURNED)
                return (null, "Semua buku di transaksi ini sudah dikembalikan");

            // Validasi semua item dulu sebelum mengubah apa pun
            foreach (var r in request.Items)
            {
                var item = transaction.BorrowingItems.FirstOrDefault(i => i.BorrowingItemId == r.BorrowingItemId);
                if (item == null)
                    return (null, $"Item {r.BorrowingItemId} bukan bagian dari transaksi ini");
                if (item.ReturnDate != null)
                    return (null, $"Item {r.BorrowingItemId} sudah dikembalikan");
            }

            await using var tx = await _db.Database.BeginTransactionAsync();

            var now = DateTime.UtcNow;
            var returnDate = DateOnly.FromDateTime(now);

            foreach (var r in request.Items)
            {
                var item = transaction.BorrowingItems.First(i => i.BorrowingItemId == r.BorrowingItemId);

                item.ReturnDate = now;
                item.ReturnCondition = r.Condition;
                item.LateDays = Math.Max(0, returnDate.DayNumber - transaction.DueDate.DayNumber);

                if (item.Inventory != null)
                {
                    item.Inventory.AvailabilityStatus =
                        r.Condition == BookCondition.LOST || r.Condition == BookCondition.DAMAGED_HEAVY
                            ? AvailabilityStatus.UNAVAILABLE
                            : AvailabilityStatus.AVAILABLE;
                }
            }

            if (transaction.BorrowingItems.All(i => i.ReturnDate != null))
                transaction.BookTransactionStatus = BookBorrowingTransactionStatus.RETURNED;

            await _db.SaveChangesAsync();

            // Buat denda untuk tiap buku yang baru dikembalikan
            var fines = new List<FineResponse>();
            foreach (var r in request.Items)
            {
                var (created, error) = await _fineService.CreateFinesForReturnAsync(r.BorrowingItemId);
                if (created == null)
                {
                    // Batalkan semuanya supaya data tidak setengah jadi
                    await tx.RollbackAsync();
                    return (null, error ?? "Gagal membuat denda");
                }
                fines.AddRange(created);
            }

            await tx.CommitAsync();

            var borrowing = await GetByIdAsync(transactionId);
            return (new ReturnResultResponse { Borrowing = borrowing!, Fines = fines }, null);
        }

        // ---------- QUERY ----------
        public async Task<List<BorrowingResponse>> GetAllAsync(BookBorrowingTransactionStatus? status)
        {
            var q = TransactionQuery();
            if (status != null) q = q.Where(t => t.BookTransactionStatus == status);
            var list = await q.OrderByDescending(t => t.CreatedAt).ToListAsync();
            return list.Select(Map).ToList();
        }

        public async Task<List<BorrowingResponse>> GetByUserAsync(long userId)
        {
            var list = await TransactionQuery()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return list.Select(Map).ToList();
        }

        public async Task<BorrowingResponse?> GetByIdAsync(long id)
        {
            var t = await TransactionQuery().FirstOrDefaultAsync(x => x.BookBorrowingTransactionId == id);
            return t == null ? null : Map(t);
        }

        // ---------- Helper ----------
        private IQueryable<BookBorrowingTransaction> TransactionQuery() => _db.BookBorrowingTransactions
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.BorrowingItems).ThenInclude(i => i.Inventory).ThenInclude(inv => inv!.Book);

        private static BorrowingResponse Map(BookBorrowingTransaction t) => new BorrowingResponse
        {
            BookBorrowingTransactionId = t.BookBorrowingTransactionId,
            UserId = t.UserId,
            Username = t.User?.Username ?? string.Empty,
            Status = t.BookTransactionStatus.ToString(),
            BorrowDate = t.BorrowDate,
            DueDate = t.DueDate,
            Items = t.BorrowingItems.Select(i => new BorrowingItemResponse
            {
                BorrowingItemId = i.BorrowingItemId,
                InventoryId = i.InventoryId,
                BookTitle = i.Inventory?.Book?.Title ?? string.Empty,
                ShelfLocation = i.Inventory?.ShelfLocation ?? string.Empty,
                ReturnDate = i.ReturnDate,
                ReturnCondition = i.ReturnCondition?.ToString(),
                LateDays = i.LateDays
            }).ToList()
        };
    }
}