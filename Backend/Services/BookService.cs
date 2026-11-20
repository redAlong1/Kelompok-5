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
        public async Task<List<BookResponse?>> GetAllAsync(GetBooksQuery query)
        {
            query ??= new GetBooksQuery();

            var books = await _bookRepository.GetAllAsync(BookIncludes);
            var filtered = books.AsEnumerable();

            if (query.Search != null)
            {
                string keyword = query.Search.Trim();
                filtered = filtered.Where(b =>
                    b.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                    b.Author.AuthorName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrWhiteSpace(b.Isbn) &&
                    b.Isbn.Contains(keyword, StringComparison.OrdinalIgnoreCase)));
            }

            if (query.CategoryId > 0)
            {
                filtered = filtered.Where(b => b.CategoryId == query.CategoryId);
            }

            if (query.StockStatus != null)
            {
                string status = query.StockStatus.Trim().ToLowerInvariant();
                if (status == "available")
                {
                    filtered = filtered.Where(b =>
                        b.Inventories != null &&
                        b.Inventories.Any(i => i.AvailabilityStatus == AvailabilityStatus.AVAILABLE));
                }
                else if (status == "borrowed")
                {
                    filtered = filtered.Where(b =>
                        b.Inventories == null ||
                        b.Inventories.Any(i => i.AvailabilityStatus == AvailabilityStatus.BORROWED));
                }
                else if (status == "reserved")
                {
                    filtered = filtered.Where(b =>
                        b.Inventories == null ||
                        b.Inventories.Any(i => i.AvailabilityStatus == AvailabilityStatus.RESERVED));
                }
            }

            string sortKey = query.Sort?.Trim().ToLower() ?? string.Empty;
            bool isDescending = query.Order == 1 || query.Order == -1;

            filtered = sortKey switch
            {
                "title" => isDescending
                    ? filtered.OrderByDescending(b => b.Title)
                    : filtered.OrderBy(b => b.Title),

                "author" => isDescending
                    ? filtered.OrderByDescending(b => b.Author?.AuthorName)
                    : filtered.OrderBy(b => b.Author?.AuthorName),

                "category" => isDescending
                    ? filtered.OrderByDescending(b => b.Category?.CategoryName)
                    : filtered.OrderBy(b => b.Category?.CategoryName),

                "publisher" => isDescending
                    ? filtered.OrderByDescending(b => b.Publisher?.PublisherName)
                    : filtered.OrderBy(b => b.Publisher?.PublisherName),

                _ => isDescending
                    ? filtered.OrderByDescending(b => b.CreatedAt).ThenByDescending(b => b.BookId)
                    : filtered.OrderBy(b => b.CreatedAt).ThenBy(b => b.BookId)
            };

            return filtered
            .Skip(query.Skip)
            .Take(query.Limit)
            .Select(MapToResponse)
            .ToList();
        }
        public async Task<BookResponse?> CreateBookAsync(BookRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

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