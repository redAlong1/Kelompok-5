using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IBookService
    {
        Task<Book?> GetByIdAsync(long id);
        Task<Book?> GetAllAsync(GetBooksQuery query);
        Task<Book?> CreateBookAsync();
        Task<Book?> UpdateBookAsync(long id);
        Task<Book?> DeleteBookAsync(long id);
    }
}
