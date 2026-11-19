using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface IAuthorService
    {
        Task<List<AuthorResponse>> GetAllAsync();
        Task<AuthorResponse?> GetByIdAsync(long id);
        Task<AuthorResponse> CreateAsync(AuthorRequest request);
        Task<AuthorResponse?> UpdateAsync(long id, AuthorRequest request);
        Task<AuthorResponse?> DeleteAsync(long id);
        AuthorResponse MapToResponse(Author author);
    }
}
