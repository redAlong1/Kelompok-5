using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IBookService
    {
        Task<Book?> GetByIdAsync(long id);
        Task<Book?> GetAllAsync(GetBooksQuery query);
        Task<Book?> CreateBookAsync(BookRequest request);
        Task<Book?> UpdateBookAsync(long id, UpdateBookRequest request);
        Task<Book?> DeleteBookAsync(long id);
    }
}
