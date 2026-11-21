using AdinsLibrary.Data;
using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AdinsLibrary.Services
{
    public class MembershipTierService : IMembershipTierService
    {
        private readonly IRepository<MembershipTier> _tierRepo;
        private readonly AdInsLibraryDbContext _dbContext;

        public MembershipTierService(IRepository<MembershipTier> tierRepo, AdInsLibraryDbContext dbContext)
        {
            _tierRepo = tierRepo;
            _dbContext = dbContext;
        }

        public async Task<List<MembershipTierResponse>> GetAllAsync()
        {
            var tiers = await _dbContext.MembershipTiers
                .Include(t => t.Users)
                .OrderBy(t => t.MinPoints)
                .ThenBy(t => t.MembershipTierId)
                .ToListAsync();

            return tiers.Select(MapToResponse).ToList();
        }

        public async Task<MembershipTierResponse?> GetByIdAsync(long id)
        {
            var tier = await _dbContext.MembershipTiers
                .Include(t => t.Users)
                .FirstOrDefaultAsync(t => t.MembershipTierId == id);

            return tier == null ? null : MapToResponse(tier);
        }

        public async Task<MembershipTierResponse> CreateAsync(MembershipTierRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            string normalizedName = request.TierName.Trim();
            var allTiers = await _tierRepo.GetAllAsync();
            if (allTiers.Any(t => string.Equals(t.TierName, normalizedName, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Tier '{normalizedName}' sudah terdaftar.");

            var entity = new MembershipTier
            {
                TierName = normalizedName,
                Discount = request.Discount,
                MinPoints = request.MinPoints,
                MaxBorrowItems = request.MaxBorrowItems,
                BorrowDurationDays = request.BorrowDurationDays,
                CreatedAt = DateTime.UtcNow
            };

            await _tierRepo.BeginTransactionAsync();
            try
            {
                await _tierRepo.AddAsync(entity);
                await _tierRepo.SaveChangesAsync();
                await _tierRepo.CommitTransactionAsync();
            }
            catch
            {
                await _tierRepo.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(entity);
        }

        public async Task<MembershipTierResponse?> UpdateAsync(long id, MembershipTierRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var existing = await _tierRepo.GetByIdAsync(id);
            if (existing == null)
                return null;

            string normalizedName = request.TierName.Trim();
            var allTiers = await _tierRepo.GetAllAsync();
            if (allTiers.Any(t => t.MembershipTierId != existing.MembershipTierId &&
                                 string.Equals(t.TierName, normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Tier '{normalizedName}' sudah digunakan tier lain.");
            }

            existing.TierName = normalizedName;
            existing.Discount = request.Discount;
            existing.MinPoints = request.MinPoints;
            existing.MaxBorrowItems = request.MaxBorrowItems;
            existing.BorrowDurationDays = request.BorrowDurationDays;

            await _tierRepo.BeginTransactionAsync();
            try
            {
                _tierRepo.Update(existing);
                await _tierRepo.SaveChangesAsync();
                await _tierRepo.CommitTransactionAsync();
            }
            catch
            {
                await _tierRepo.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(existing);
        }

        public async Task<MembershipTierResponse?> DeleteAsync(long id)
        {
            var existing = await _dbContext.MembershipTiers
                .Include(t => t.Users)
                .FirstOrDefaultAsync(t => t.MembershipTierId == id);

            if (existing == null)
                return null;

            if (existing.Users != null && existing.Users.Any())
            {
                throw new InvalidOperationException($"Tidak dapat menghapus tier '{existing.TierName}' karena masih digunakan oleh {existing.Users.Count} user.");
            }

            var response = MapToResponse(existing);

            await _tierRepo.BeginTransactionAsync();
            try
            {
                _tierRepo.Delete(existing);
                await _tierRepo.SaveChangesAsync();
                await _tierRepo.CommitTransactionAsync();
            }
            catch
            {
                await _tierRepo.RollbackTransactionAsync();
                throw;
            }

            return response;
        }

        private static MembershipTierResponse MapToResponse(MembershipTier tier)
        {
            return new MembershipTierResponse
            {
                MembershipTierId = tier.MembershipTierId,
                TierName = tier.TierName,
                Discount = tier.Discount,
                MinPoints = tier.MinPoints,
                MaxBorrowItems = tier.MaxBorrowItems,
                BorrowDurationDays = tier.BorrowDurationDays,
                CreatedAt = tier.CreatedAt,
                TotalUsers = tier.Users?.Count ?? 0
            };
        }
    }
}
