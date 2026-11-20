using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IBookService
    {
        Task<BookResponse?> GetByIdAsync(long id);
        Task<List<BookResponse?>> GetAllAsync();
        Task<BookResponse?> CreateBookAsync(BookRequest book);
        Task<BookResponse?> UpdateBookAsync(long id, UpdateBookRequest book);
        Task<BookResponse?> DeleteBookAsync(long id);
        BookResponse MapToResponse(Book book);
    }
}
