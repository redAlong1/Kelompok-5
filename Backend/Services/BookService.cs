using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class BookService : IBookService
    {
        private static readonly string[] BookIncludes = new string[]
        {
        nameof(Book.Author),
        nameof(Book.Category),
        nameof(Book.Publisher),
        nameof(Book.Inventories)
        };

        private readonly IRepository<Book> _bookRepository;
        private readonly IRepository<Author> _authorRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Publisher> _publisherRepository;
        private readonly IRepository<Inventory> _inventoryRepository;

        public BookService(
            IRepository<Book> bookRepository,
            IRepository<Author> authorRepository,
            IRepository<Category> categoryRepository,
            IRepository<Publisher> publisherRepository,
            IRepository<Inventory> inventoryRepository
        )
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _categoryRepository = categoryRepository;
            _publisherRepository = publisherRepository;
            _inventoryRepository = inventoryRepository;
        }

        public async Task<BookResponse?> GetByIdAsync(long id)
        {
            var book = await _bookRepository.GetByIdAsync(id, BookIncludes);
            return book == null ? null : MapToResponse(book);
        }
        public async Task<List<BookResponse?>> GetAllAsync()
        {
            var books = await _bookRepository.GetAllAsync(BookIncludes);
            return books
                .OrderByDescending(b => b.CreatedAt)
                .ThenBy(b => b.BookId)
                .Select(MapToResponse)
                .ToList();
        }
        public async Task<BookResponse?> CreateBookAsync(BookRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if(request.Price < 0)
                throw new ArgumentException("Price tidak boleh kurang dari 0.", nameof(request.Price));

            string? normalizedIsbn = string.IsNullOrWhiteSpace(request.Isbn) ? null : request.Isbn.Trim();
            if (normalizedIsbn != null)
            {
                var allBooks = await _bookRepository.GetAllAsync();
                if (allBooks.Any(b => string.Equals(b.Isbn, normalizedIsbn, StringComparison.OrdinalIgnoreCase)))
                    throw new InvalidOperationException($"ISBN '{normalizedIsbn}' sudah terdaftar.");
            }

            var newBook = new Book
            {
                Title = request.Title.Trim(),
                Isbn = normalizedIsbn,
                CoverUrl = string.IsNullOrWhiteSpace(request.CoverUrl) ? null : request.CoverUrl.Trim(),
                Price = request.Price,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                AuthorId = request.AuthorId,
                CategoryId = request.CategoryId,
                PublisherId = request.PublisherId,
                CreatedAt = DateTime.UtcNow
            };

            await _bookRepository.BeginTransactionAsync();
            try
            {
                await _bookRepository.AddAsync(newBook);
                await _bookRepository.SaveChangesAsync();

                var initialInventory = new Inventory
                {
                    BookId = newBook.BookId,
                    ShelfLocation = string.Empty,
                    AvailabilityStatus = AvailabilityStatus.AVAILABLE
                };

                await _inventoryRepository.AddAsync(initialInventory);
                await _inventoryRepository.SaveChangesAsync();

                await _bookRepository.CommitTransactionAsync();
            }
            catch
            {
                await _bookRepository.RollbackTransactionAsync();
                throw;
            }

            var createdBook = await _bookRepository.GetByIdAsync(newBook.BookId, BookIncludes);
            return createdBook == null ? null : MapToResponse(createdBook);
        }
        public async Task<BookResponse?> UpdateBookAsync(long id, UpdateBookRequest request)
        {
            var existingBook = await _bookRepository.GetByIdAsync(id);
            if (existingBook == null)
                return null;

            if (request.Price < 0)
                throw new ArgumentException("Price tidak boleh kurang dari 0.", nameof(request.Price));

            string? normalizedIsbn = string.IsNullOrWhiteSpace(request.Isbn) ? null : request.Isbn.Trim();
            if (normalizedIsbn != null)
            {
                var allBooks = await _bookRepository.GetAllAsync();
                if (allBooks.Any(b => b.BookId != existingBook.BookId &&
                                      string.Equals(b.Isbn, normalizedIsbn, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidOperationException($"ISBN '{normalizedIsbn}' sudah digunakan buku lain.");
                }
            }

            existingBook.Title = request.Title.Trim();
            existingBook.Isbn = normalizedIsbn;
            existingBook.CoverUrl = string.IsNullOrWhiteSpace(request.CoverUrl) ? null : request.CoverUrl.Trim();
            existingBook.Price = request.Price;
            existingBook.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            existingBook.AuthorId = request.AuthorId;
            existingBook.CategoryId = request.CategoryId;
            existingBook.PublisherId = request.PublisherId;

            await _bookRepository.BeginTransactionAsync();
            try
            {
                _bookRepository.Update(existingBook);
                await _bookRepository.SaveChangesAsync();
                await _bookRepository.CommitTransactionAsync();
            }
            catch
            {
                await _bookRepository.RollbackTransactionAsync();
                throw;
            }

            var updatedBook = await _bookRepository.GetByIdAsync(existingBook.BookId, BookIncludes);
            return updatedBook == null ? null : MapToResponse(updatedBook);
        }
        public async Task<BookResponse?> DeleteBookAsync(long id)
        {
            var existingBook = await _bookRepository.GetByIdAsync(id, BookIncludes);
            if (existingBook == null)
                return null;

            var response = MapToResponse(existingBook);

            await _bookRepository.BeginTransactionAsync();
            try
            {
                _bookRepository.Delete(existingBook);
                await _bookRepository.SaveChangesAsync();
                await _bookRepository.CommitTransactionAsync();
            }
            catch
            {
                await _bookRepository.RollbackTransactionAsync();
                throw;
            }

            return response;
        }

        public BookResponse MapToResponse(Book book)
        {
            var inventories = book.Inventories?.ToList() ?? new List<Inventory>();

            return new BookResponse
            {
                BookId = book.BookId,
                Title = book.Title,
                Isbn = book.Isbn,
                Price = book.Price,
                CoverUrl = book.CoverUrl,
                Description = book.Description,
                CreatedAt = book.CreatedAt,
                AuthorId = book.AuthorId,
                Author = book.Author == null ? null : new BookAuthorDto
                {
                    AuthorId = book.Author.AuthorId,
                    AuthorName = book.Author.AuthorName
                },
                CategoryId = book.CategoryId,
                Category = book.Category == null ? null : new BookCategoryDto
                {
                    CategoryId = book.Category.CategoryId,
                    CategoryName = book.Category.CategoryName
                },
                PublisherId = book.PublisherId,
                Publisher = book.Publisher == null ? null : new BookPublisherDto
                {
                    PublisherId = book.Publisher.PublisherId,
                    PublisherName = book.Publisher.PublisherName
                },
                TotalStock = inventories.Count,
                AvailableStock = inventories.Count(i => i.AvailabilityStatus == AvailabilityStatus.AVAILABLE),
                Inventories = inventories.Select(i => new BookInventoryDto
                {
                    InventoryId = i.InventoryId,
                    AvailabilityStatus = i.AvailabilityStatus.ToString()
                }).ToList()
            };
        }
    }
}