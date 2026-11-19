using AdinsLibrary.Models;
using AdinsLibrary.Repositories;
using System.Linq.Expressions;

namespace AdinsLibrary.Services
{
    public class BookService : IBookService
    {
        private readonly IRepository<Book> _bookRepository;

        public BookService (
            IRepository<Book> bookRepository
        )
        {
            _bookRepository = bookRepository;
        }


        public async Task<Book?> GetByIdAsync(long id)
        {
            return await _bookRepository.GetByIdAsync(id);
        }
        public async Task<Book?> GetAllAsync(GetBooksQuery query)
        {
            var books = await _bookRepository.GetAllAsync();
            if(query.Search != null)
            {
                string keyword = query.Search.ToLower();

                books = books.Where(b => b.Title.ToLower().Contains(keyword)).ToList();
            }

            if (query.CategoryId != 0)
            {
                books = books.Where(b => b.CategoryId == query.CategoryId).ToList();
            }




        }
        public Task<Book?> CreateBookAsync()
        {

        }
        public Task<Book?> UpdateBookAsync(long id)
        {

        }
        Task<Book?> DeleteBookAsync(long id)
        {

        }
    }
}
