using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IRepository<Inventory> _inventoryRepository;
        private readonly IRepository<Book> _bookRepository;

        public InventoryService(IRepository<Inventory> inventoryRepository, IRepository<Book> bookRepository)
        {
            _inventoryRepository = inventoryRepository;
            _bookRepository = bookRepository;
        }

        public async Task<List<InventoryResponse>> GetAllAsync(long? bookId = null)
        {
            var items = await _inventoryRepository.GetAllAsync(nameof(Inventory.Book));
            if (bookId.HasValue && bookId.Value > 0)
            {
                items = items.Where(i => i.BookId == bookId.Value).ToList();
            }

            return items.Select(MapToResponse).ToList();
        }

        public async Task<InventoryResponse?> GetByIdAsync(long id)
        {
            var item = await _inventoryRepository.GetByIdAsync(id, nameof(Inventory.Book));
            return item == null ? null : MapToResponse(item);
        }

        public async Task<List<InventoryResponse>> CreateAsync(CreateInventoryRequest request)
        {
            var book = await _bookRepository.GetByIdAsync(request.BookId);
            if (book == null)
            {
                throw new InvalidOperationException($"Buku dengan ID {request.BookId} tidak ditemukan.");
            }

            var count = request.Quantity <= 0 ? 1 : request.Quantity;
            var createdList = new List<Inventory>();

            for (int i = 0; i < count; i++)
            {
                var entity = new Inventory
                {
                    BookId = request.BookId,
                    ShelfLocation = request.ShelfLocation?.Trim() ?? string.Empty,
                    AvailabilityStatus = request.AvailabilityStatus
                };
                await _inventoryRepository.AddAsync(entity);
                createdList.Add(entity);
            }

            await _inventoryRepository.SaveChangesAsync();

            return createdList.Select(i => new InventoryResponse
            {
                InventoryId = i.InventoryId,
                BookId = book.BookId,
                BookTitle = book.Title,
                BookIsbn = book.Isbn,
                ShelfLocation = i.ShelfLocation,
                AvailabilityStatus = i.AvailabilityStatus
            }).ToList();
        }

        public async Task<InventoryResponse?> UpdateAsync(long id, UpdateInventoryRequest request)
        {
            var entity = await _inventoryRepository.GetByIdAsync(id, nameof(Inventory.Book));
            if (entity == null)
            {
                return null;
            }

            entity.ShelfLocation = request.ShelfLocation?.Trim() ?? string.Empty;
            entity.AvailabilityStatus = request.AvailabilityStatus;

            _inventoryRepository.Update(entity);
            await _inventoryRepository.SaveChangesAsync();

            return MapToResponse(entity);
        }

        public async Task<InventoryResponse?> DeleteAsync(long id)
        {
            var entity = await _inventoryRepository.GetByIdAsync(id, nameof(Inventory.Book), nameof(Inventory.BorrowingItems));
            if (entity == null)
            {
                return null;
            }

            if (entity.BorrowingItems != null && entity.BorrowingItems.Any())
            {
                throw new InvalidOperationException("Eksemplar tidak dapat dihapus karena memiliki riwayat peminjaman.");
            }

            var response = MapToResponse(entity);
            _inventoryRepository.Delete(entity);
            await _inventoryRepository.SaveChangesAsync();

            return response;
        }

        private static InventoryResponse MapToResponse(Inventory entity)
        {
            return new InventoryResponse
            {
                InventoryId = entity.InventoryId,
                BookId = entity.BookId,
                BookTitle = entity.Book?.Title ?? string.Empty,
                BookIsbn = entity.Book?.Isbn,
                ShelfLocation = entity.ShelfLocation,
                AvailabilityStatus = entity.AvailabilityStatus
            };
        }
    }
}
