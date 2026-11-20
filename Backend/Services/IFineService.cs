using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IFineService
    {
        Task<(List<FineResponse>? Fines, string? Error)> CreateFinesForReturnAsync(long borrowingItemId);
        Task<List<FineResponse>> GetAllAsync(FineStatus? status, FineType? type);
        Task<List<FineResponse>> GetByUserAsync(long userId);
        Task<List<AccruingFineResponse>> GetAccruingAsync(long userId);
        Task<FineResponse?> GetByIdAsync(long id);
        Task<(bool Success, string? Error)> MarkAsPaidAsync(long id);
        Task<bool> HasUnpaidFinesAsync(long userId);
    }
}