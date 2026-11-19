using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IPublisherService
    {
        Task<List<PublisherResponse>> GetAllAsync();
        Task<PublisherResponse?> GetByIdAsync(long id);
        Task<PublisherResponse> CreateAsync(PublisherRequest request);
        Task<PublisherResponse?> UpdateAsync(long id, PublisherRequest request);
        Task<PublisherResponse?> DeleteAsync(long id);
        PublisherResponse MapToResponse(Publisher publisher);
    }
}
