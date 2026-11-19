using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class AuthorService : IAuthorService
    {
        private readonly IRepository<Author> _authorRepository;

        public AuthorService(IRepository<Author> authorRepository)
        {
            _authorRepository = authorRepository;
        }

        public async Task<List<AuthorResponse>> GetAllAsync()
        {
            var authors = await _authorRepository.GetAllAsync();
            return authors
                .OrderByDescending(a => a.CreatedAt)
                .ThenBy(a => a.AuthorId)
                .Select(MapToResponse)
                .ToList();
        }

        public async Task<AuthorResponse?> GetByIdAsync(long id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            return author == null ? null : MapToResponse(author);
        }

        public async Task<AuthorResponse> CreateAsync(AuthorRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var entity = new Author
            {
                AuthorName = request.AuthorName.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _authorRepository.BeginTransactionAsync();
            try
            {
                await _authorRepository.AddAsync(entity);
                await _authorRepository.SaveChangesAsync();
                await _authorRepository.CommitTransactionAsync();
            }
            catch
            {
                await _authorRepository.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(entity);
        }

        public async Task<AuthorResponse?> UpdateAsync(long id, AuthorRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var existing = await _authorRepository.GetByIdAsync(id);
            if (existing == null)
                return null;

            existing.AuthorName = request.AuthorName.Trim();

            await _authorRepository.BeginTransactionAsync();
            try
            {
                _authorRepository.Update(existing);
                await _authorRepository.SaveChangesAsync();
                await _authorRepository.CommitTransactionAsync();
            }
            catch
            {
                await _authorRepository.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(existing);
        }

        public async Task<AuthorResponse?> DeleteAsync(long id)
        {
            var existing = await _authorRepository.GetByIdAsync(id);
            if (existing == null)
                return null;

            var response = MapToResponse(existing);

            await _authorRepository.BeginTransactionAsync();
            try
            {
                _authorRepository.Delete(existing);
                await _authorRepository.SaveChangesAsync();
                await _authorRepository.CommitTransactionAsync();
            }
            catch
            {
                await _authorRepository.RollbackTransactionAsync();
                throw;
            }

            return response;
        }

        public AuthorResponse MapToResponse(Author author)
        {
            return new AuthorResponse
            {
                AuthorId = author.AuthorId,
                AuthorName = author.AuthorName,
                CreatedAt = author.CreatedAt
            };
        }
    }
}
