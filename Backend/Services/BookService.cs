using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class BookService : IBookService
    {
        private readonly IRepository<Book> _bookRepository;

        public BookService(IRepository<Book> bookRepository)
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

            if (!string.IsNullOrEmpty(query.Search))
            {
                string keyword = query.Search.ToLower();
                books = books.Where(b => b.Title.ToLower().Contains(keyword)).ToList();
            }

            if (query.CategoryId != 0)
            {
                books = books.Where(b => b.CategoryId == query.CategoryId).ToList();
            }

            return books.FirstOrDefault();
        }

        public async Task<Book?> CreateBookAsync(BookRequest request)
        {
            var book = new Book
            {
                Title = request.Title,
                Isbn = request.Isbn ?? string.Empty,
                Description = request.Description ?? string.Empty,
                AuthorId = request.AuthorId,
                CategoryId = request.CategoryId,
                PublisherId = request.PublisherId
            };

            await _bookRepository.AddAsync(book);
            return book;
        }

        public async Task<Book?> UpdateBookAsync(long id, UpdateBookRequest request)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
                return null;

            book.Title = request.Title;
            book.Isbn = request.Isbn ?? string.Empty;
            book.Description = request.Description ?? string.Empty;
            book.AuthorId = request.AuthorId;
            book.CategoryId = request.CategoryId;
            book.PublisherId = request.PublisherId;

            _bookRepository.Update(book);
            await _bookRepository.SaveChangesAsync();
            return book;
        }

        public async Task<Book?> DeleteBookAsync(long id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
                return null;

            _bookRepository.Delete(book);
            await _bookRepository.SaveChangesAsync();
            return book;
        }
    }
}
