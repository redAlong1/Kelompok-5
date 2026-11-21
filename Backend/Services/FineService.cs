using AdinsLibrary.Data;
using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace AdinsLibrary.Services
{
    public class FineService : IFineService
    {
        private readonly AdInsLibraryDbContext _db;
        private readonly IConfiguration _config;

        public FineService(AdInsLibraryDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // ---------- Dipanggil saat buku dikembalikan ----------
        public async Task<(List<FineResponse>? Fines, string? Error)> CreateFinesForReturnAsync(long borrowingItemId)
        {
            var item = await _db.BorrowingItems
                .Include(i => i.Fines)
                .Include(i => i.Inventory).ThenInclude(inv => inv!.Book)
                .Include(i => i.BookBorrowingTransaction).ThenInclude(t => t.User).ThenInclude(u => u!.MembershipTier)
                .FirstOrDefaultAsync(i => i.BorrowingItemId == borrowingItemId);

            if (item == null)
                return (null, "Item peminjaman tidak ditemukan");
            if (item.ReturnDate == null)
                return (null, "Buku belum dikembalikan");

            // Cegah denda ganda: kalau sudah pernah dibuat, kembalikan yang ada
            if (item.Fines.Any())
                return (await GetByBorrowingItemAsync(borrowingItemId), null);

            var book = item.Inventory?.Book;
            var tier = item.BookBorrowingTransaction.User?.MembershipTier;
            if (book == null || tier == null)
                return (null, "Data buku atau membership tidak lengkap");

            decimal price = book.Price;
            decimal first3DaysRate = _config.GetValue<decimal?>("Fine:RatePerDay") ?? 2000m;
            decimal after3DaysRate = _config.GetValue<decimal?>("Fine:RatePerDayAfter3Days") ?? 5000m;
            decimal lightPct = _config.GetValue<decimal>("Fine:DamagedPercentLight");
            decimal heavyPct = _config.GetValue<decimal>("Fine:DamagedPercentHeavy");
            decimal lostFee = _config.GetValue<decimal>("Fine:LostAdminFee");
            decimal tierDiscountPct = tier.Discount;

            var condition = item.ReturnCondition ?? BookCondition.GOOD;

            DateOnly due = item.BookBorrowingTransaction.DueDate;
            DateOnly returned = DateOnly.FromDateTime(item.ReturnDate.Value);
            int lateDays = Math.Max(0, returned.DayNumber - due.DayNumber);
            item.LateDays = lateDays;

            var drafts = new List<(FineType Type, decimal Base)>();

            if (condition == BookCondition.LOST)
            {
                // Buku hilang: cukup denda hilang, tanpa denda terlambat
                drafts.Add((FineType.LOST, price + lostFee));
            }
            else
            {
                decimal damagedBase = condition switch
                {
                    BookCondition.DAMAGED_LIGHT => price * lightPct / 100m,
                    BookCondition.DAMAGED_HEAVY => price * heavyPct / 100m,
                    _ => 0m
                };
                damagedBase = Math.Round(damagedBase, 2);

                if (damagedBase > 0)
                    drafts.Add((FineType.DAMAGED, damagedBase));

                if (lateDays > 0)
                {
                    decimal rawLateFine = CalculateTieredLateFine(lateDays, first3DaysRate, after3DaysRate);
                    decimal maxAllowedLate = Math.Max(0m, price - damagedBase);
                    decimal lateBase = Math.Min(rawLateFine, maxAllowedLate);

                    if (lateBase > 0)
                        drafts.Add((FineType.LATE, Math.Round(lateBase, 2)));
                }
            }

            foreach (var d in drafts)
            {
                decimal discount = Math.Round(d.Base * tierDiscountPct / 100m, 2);
                _db.Fines.Add(new Fine
                {
                    BorrowingItemId = item.BorrowingItemId,
                    FineType = d.Type,
                    BaseAmount = d.Base,
                    DiscountAmount = discount,
                    Amount = d.Base - discount,
                    FineStatus = FineStatus.UNPAID,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();
            return (await GetByBorrowingItemAsync(borrowingItemId), null);
        }

        // ---------- Query ----------
        public async Task<List<FineResponse>> GetAllAsync(FineStatus? status, FineType? type)
        {
            var q = FineQuery();
            if (status != null) q = q.Where(f => f.FineStatus == status);
            if (type != null) q = q.Where(f => f.FineType == type);

            var fines = await q.OrderByDescending(f => f.CreatedAt).ToListAsync();
            return fines.Select(Map).ToList();
        }

        public async Task<List<FineResponse>> GetByUserAsync(long userId)
        {
            var fines = await FineQuery()
                .Where(f => f.BorrowingItem!.BookBorrowingTransaction.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
            return fines.Select(Map).ToList();
        }

        public async Task<FineResponse?> GetByIdAsync(long id)
        {
            var fine = await FineQuery().FirstOrDefaultAsync(f => f.FineId == id);
            return fine == null ? null : Map(fine);
        }

        // ---------- Denda berjalan (estimasi, tidak disimpan) ----------
        public async Task<List<AccruingFineResponse>> GetAccruingAsync(long userId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            decimal first3DaysRate = _config.GetValue<decimal?>("Fine:RatePerDay") ?? 2000m;
            decimal after3DaysRate = _config.GetValue<decimal?>("Fine:RatePerDayAfter3Days") ?? 5000m;

            var items = await _db.BorrowingItems
                .Include(i => i.Inventory).ThenInclude(inv => inv!.Book)
                .Include(i => i.BookBorrowingTransaction).ThenInclude(t => t.User).ThenInclude(u => u!.MembershipTier)
                .Where(i => i.ReturnDate == null
                         && i.BookBorrowingTransaction.UserId == userId
                         && i.BookBorrowingTransaction.DueDate < today)
                .ToListAsync();

            var result = new List<AccruingFineResponse>();
            foreach (var i in items)
            {
                var book = i.Inventory?.Book;
                if (book == null) continue;

                DateOnly due = i.BookBorrowingTransaction.DueDate;
                int lateDays = Math.Max(0, today.DayNumber - due.DayNumber);
                decimal discountPct = i.BookBorrowingTransaction.User?.MembershipTier?.Discount ?? 0m;

                decimal rawLateFine = CalculateTieredLateFine(lateDays, first3DaysRate, after3DaysRate);
                decimal baseAmount = Math.Min(rawLateFine, book.Price);
                decimal discountAmount = Math.Round(baseAmount * discountPct / 100m, 2);
                decimal amount = Math.Round(baseAmount - discountAmount, 2);

                result.Add(new AccruingFineResponse
                {
                    BorrowingItemId = i.BorrowingItemId,
                    BookTitle = book.Title,
                    DueDate = due,
                    LateDays = lateDays,
                    EstimatedAmount = amount
                });
            }
            return result;
        }

        // ---------- Pembayaran ----------
        public async Task<(bool Success, string? Error)> MarkAsPaidAsync(long id)
        {
            var fine = await _db.Fines.FindAsync(id);
            if (fine == null)
                return (false, "Denda tidak ditemukan");
            if (fine.FineStatus == FineStatus.PAID)
                return (false, "Denda sudah lunas");

            fine.FineStatus = FineStatus.PAID;
            fine.PaidDate = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> HasUnpaidFinesAsync(long userId)
        {
            return await _db.Fines.AnyAsync(f =>
                f.FineStatus == FineStatus.UNPAID &&
                f.BorrowingItem!.BookBorrowingTransaction.UserId == userId);
        }

        // ---------- Helper ----------
        private static decimal CalculateTieredLateFine(int lateDays, decimal first3DaysRate, decimal after3DaysRate)
        {
            if (lateDays <= 0) return 0m;

            int first3Days = Math.Min(lateDays, 3);
            int remainingDays = Math.Max(0, lateDays - 3);

            return (first3Days * first3DaysRate) + (remainingDays * after3DaysRate);
        }

        private IQueryable<Fine> FineQuery() => _db.Fines
            .Include(f => f.BorrowingItem).ThenInclude(i => i!.Inventory).ThenInclude(inv => inv!.Book)
            .Include(f => f.BorrowingItem).ThenInclude(i => i!.BookBorrowingTransaction).ThenInclude(t => t.User);

        private async Task<List<FineResponse>> GetByBorrowingItemAsync(long borrowingItemId)
        {
            var fines = await FineQuery()
                .Where(f => f.BorrowingItemId == borrowingItemId)
                .ToListAsync();
            return fines.Select(Map).ToList();
        }

        private static FineResponse Map(Fine f) => new FineResponse
        {
            FineId = f.FineId,
            BorrowingItemId = f.BorrowingItemId,
            UserId = f.BorrowingItem?.BookBorrowingTransaction?.UserId ?? 0,
            Username = f.BorrowingItem?.BookBorrowingTransaction?.User?.Username ?? string.Empty,
            BookTitle = f.BorrowingItem?.Inventory?.Book?.Title ?? string.Empty,
            FineType = f.FineType.ToString(),
            BaseAmount = f.BaseAmount,
            DiscountAmount = f.DiscountAmount,
            Amount = f.Amount,
            FineStatus = f.FineStatus.ToString(),
            PaidDate = f.PaidDate,
            CreatedAt = f.CreatedAt
        };
    }
}