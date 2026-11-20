//using AdinsLibrary.DTOs;
//using AdinsLibrary.Models;
//using AdinsLibrary.Repositories;

//namespace AdinsLibrary.Services
//{
//    public class CategoryService : ICategoryService
//    {
//        private readonly IRepository<Category> _categoryRepository;

//        public CategoryService(IRepository<Category> categoryRepository)
//        {
//            _categoryRepository = categoryRepository;
//        }

//        public async Task<List<CategoryResponse>> GetAllAsync()
//        {
//            var categories = await _categoryRepository.GetAllAsync();
//            return categories
//                .OrderByDescending(c => c.CreatedAt)
//                .ThenBy(c => c.CategoryId)
//                .Select(MapToResponse)
//                .ToList();
//        }

//        public async Task<CategoryResponse?> GetByIdAsync(long id)
//        {
//            var category = await _categoryRepository.GetByIdAsync(id);
//            return category == null ? null : MapToResponse(category);
//        }

//        public async Task<CategoryResponse> CreateAsync(CategoryRequest request)
//        {
//            if (request == null)
//                throw new ArgumentNullException(nameof(request));

//            string normalizedName = request.CategoryName.Trim();
//            var allCategories = await _categoryRepository.GetAllAsync();
//            if (allCategories.Any(c => string.Equals(c.CategoryName, normalizedName, StringComparison.OrdinalIgnoreCase)))
//                throw new InvalidOperationException($"Category '{normalizedName}' sudah terdaftar.");

//            var entity = new Category
//            {
//                CategoryName = normalizedName,
//                Description = string.IsNullOrWhiteSpace(request.Description) ? string.Empty : request.Description.Trim(),
//                CreatedAt = DateTime.UtcNow
//            };

//            await _categoryRepository.BeginTransactionAsync();
//            try
//            {
//                await _categoryRepository.AddAsync(entity);
//                await _categoryRepository.SaveChangesAsync();
//                await _categoryRepository.CommitTransactionAsync();
//            }
//            catch
//            {
//                await _categoryRepository.RollbackTransactionAsync();
//                throw;
//            }

//            return MapToResponse(entity);
//        }

//        public async Task<CategoryResponse?> UpdateAsync(long id, CategoryRequest request)
//        {
//            if (request == null)
//                throw new ArgumentNullException(nameof(request));

//            var existing = await _categoryRepository.GetByIdAsync(id);
//            if (existing == null)
//                return null;

//            string normalizedName = request.CategoryName.Trim();
//            var allCategories = await _categoryRepository.GetAllAsync();
//            if (allCategories.Any(c => c.CategoryId != existing.CategoryId &&
//                                       string.Equals(c.CategoryName, normalizedName, StringComparison.OrdinalIgnoreCase)))
//            {
//                throw new InvalidOperationException($"Category '{normalizedName}' sudah digunakan kategori lain.");
//            }

//            existing.CategoryName = normalizedName;
//            existing.Description = string.IsNullOrWhiteSpace(request.Description) ? string.Empty : request.Description.Trim();

//            await _categoryRepository.BeginTransactionAsync();
//            try
//            {
//                _categoryRepository.Update(existing);
//                await _categoryRepository.SaveChangesAsync();
//                await _categoryRepository.CommitTransactionAsync();
//            }
//            catch
//            {
//                await _categoryRepository.RollbackTransactionAsync();
//                throw;
//            }

//            return MapToResponse(existing);
//        }

//        public async Task<CategoryResponse?> DeleteAsync(long id)
//        {
//            var existing = await _categoryRepository.GetByIdAsync(id);
//            if (existing == null)
//                return null;

//            var response = MapToResponse(existing);

//            await _categoryRepository.BeginTransactionAsync();
//            try
//            {
//                _categoryRepository.Delete(existing);
//                await _categoryRepository.SaveChangesAsync();
//                await _categoryRepository.CommitTransactionAsync();
//            }
//            catch
//            {
//                await _categoryRepository.RollbackTransactionAsync();
//                throw;
//            }

//            return response;
//        }

//        public CategoryResponse MapToResponse(Category category)
//        {
//            return new CategoryResponse
//            {
//                CategoryId = category.CategoryId,
//                CategoryName = category.CategoryName,
//                Description = category.Description,
//                CreatedAt = category.CreatedAt
//            };
//        }
//    }
//}
