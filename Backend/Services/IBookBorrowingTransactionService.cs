using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IBookBorrowingTransactionService
    {
        Task<(BorrowingResponse? Result, string? Error)> BorrowAsync(BorrowRequest request);
        Task<(ReturnResultResponse? Result, string? Error)> ReturnAsync(long transactionId, ReturnRequest request);
        Task<List<BorrowingResponse>> GetAllAsync(BookBorrowingTransactionStatus? status);
        Task<List<BorrowingResponse>> GetByUserAsync(long userId);
        Task<BorrowingResponse?> GetByIdAsync(long id);
    }
}