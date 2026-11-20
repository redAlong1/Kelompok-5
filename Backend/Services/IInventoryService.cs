using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IInventoryService
    {
        Task<List<InventoryResponse>> GetAllAsync(long? bookId = null);
        Task<InventoryResponse?> GetByIdAsync(long id);
        Task<List<InventoryResponse>> CreateAsync(CreateInventoryRequest request);
        Task<InventoryResponse?> UpdateAsync(long id, UpdateInventoryRequest request);
        Task<InventoryResponse?> DeleteAsync(long id);
    }
}
