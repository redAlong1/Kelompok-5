using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IRoleService
    {
        Task<List<RoleResponse>> GetAllAsync();
        Task<RoleResponse?> GetByIdAsync(long id);
        Task<RoleResponse?> CreateAsync(RoleRequest request);   // null = nama sudah ada
        Task<RoleResponse?> UpdateAsync(long id, RoleRequest request); // null = tidak ditemukan
        Task<(bool Success, string? Error)> DeleteAsync(long id);
        Task<(bool Success, string? Error)> AssignRoleAsync(AssignRoleRequest request);
    }
}