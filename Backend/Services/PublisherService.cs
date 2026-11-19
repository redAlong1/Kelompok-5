using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Repositories;

namespace AdinsLibrary.Services
{
    public class PublisherService : IPublisherService
    {
        private readonly IRepository<Publisher> _publisherRepository;

        public PublisherService(IRepository<Publisher> publisherRepository)
        {
            _publisherRepository = publisherRepository;
        }

        public async Task<List<PublisherResponse>> GetAllAsync()
        {
            var publishers = await _publisherRepository.GetAllAsync();
            return publishers
                .OrderByDescending(p => p.CreatedAt)
                .ThenBy(p => p.PublisherId)
                .Select(MapToResponse)
                .ToList();
        }

        public async Task<PublisherResponse?> GetByIdAsync(long id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            return publisher == null ? null : MapToResponse(publisher);
        }

        public async Task<PublisherResponse> CreateAsync(PublisherRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            string normalizedName = request.PublisherName.Trim();
            var allPublishers = await _publisherRepository.GetAllAsync();
            if (allPublishers.Any(p => string.Equals(p.PublisherName, normalizedName, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Publisher '{normalizedName}' sudah terdaftar.");

            var entity = new Publisher
            {
                PublisherName = normalizedName,
                CreatedAt = DateTime.UtcNow
            };

            await _publisherRepository.BeginTransactionAsync();
            try
            {
                await _publisherRepository.AddAsync(entity);
                await _publisherRepository.SaveChangesAsync();
                await _publisherRepository.CommitTransactionAsync();
            }
            catch
            {
                await _publisherRepository.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(entity);
        }

        public async Task<PublisherResponse?> UpdateAsync(long id, PublisherRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var existing = await _publisherRepository.GetByIdAsync(id);
            if (existing == null)
                return null;

            string normalizedName = request.PublisherName.Trim();
            var allPublishers = await _publisherRepository.GetAllAsync();
            if (allPublishers.Any(p => p.PublisherId != existing.PublisherId &&
                                       string.Equals(p.PublisherName, normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Publisher '{normalizedName}' sudah digunakan penerbit lain.");
            }

            existing.PublisherName = normalizedName;

            await _publisherRepository.BeginTransactionAsync();
            try
            {
                _publisherRepository.Update(existing);
                await _publisherRepository.SaveChangesAsync();
                await _publisherRepository.CommitTransactionAsync();
            }
            catch
            {
                await _publisherRepository.RollbackTransactionAsync();
                throw;
            }

            return MapToResponse(existing);
        }

        public async Task<PublisherResponse?> DeleteAsync(long id)
        {
            var existing = await _publisherRepository.GetByIdAsync(id);
            if (existing == null)
                return null;

            var response = MapToResponse(existing);

            await _publisherRepository.BeginTransactionAsync();
            try
            {
                _publisherRepository.Delete(existing);
                await _publisherRepository.SaveChangesAsync();
                await _publisherRepository.CommitTransactionAsync();
            }
            catch
            {
                await _publisherRepository.RollbackTransactionAsync();
                throw;
            }

            return response;
        }

        public PublisherResponse MapToResponse(Publisher publisher)
        {
            return new PublisherResponse
            {
                PublisherId = publisher.PublisherId,
                PublisherName = publisher.PublisherName,
                CreatedAt = publisher.CreatedAt
            };
        }
    }
}
