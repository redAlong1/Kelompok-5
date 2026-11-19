using AdinsLibrary.DTOs;
using AdinsLibrary.Models;

namespace AdinsLibrary.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryResponse>> GetAllAsync();
        Task<CategoryResponse?> GetByIdAsync(long id);
        Task<CategoryResponse> CreateAsync(CategoryRequest request);
        Task<CategoryResponse?> UpdateAsync(long id, CategoryRequest request);
        Task<CategoryResponse?> DeleteAsync(long id);
        CategoryResponse MapToResponse(Category category);
    }
}
