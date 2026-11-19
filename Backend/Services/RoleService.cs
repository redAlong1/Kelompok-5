using AdinsLibrary.Data;      // SESUAIKAN namespace AppDbContext
using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace AdinsLibrary.Services
{
    public class RoleService : IRoleService
    {
        private readonly AdInsLibraryDbContext _db;

        public RoleService(AdInsLibraryDbContext db)
        {
            _db = db;
        }

        public async Task<List<RoleResponse>> GetAllAsync()
        {
            return await _db.Roles
                .Select(r => new RoleResponse
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    CreatedAt = r.CreatedAt,
                    UserCount = r.Users.Count
                })
                .ToListAsync();
        }

        public async Task<RoleResponse?> GetByIdAsync(long id)
        {
            return await _db.Roles
                .Where(r => r.RoleId == id)
                .Select(r => new RoleResponse
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    CreatedAt = r.CreatedAt,
                    UserCount = r.Users.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<RoleResponse?> CreateAsync(RoleRequest request)
        {
            var name = request.RoleName.Trim();

            if (await _db.Roles.AnyAsync(r => r.RoleName == name))
                return null;

            var role = new Role { RoleName = name };
            _db.Roles.Add(role);
            await _db.SaveChangesAsync();

            return new RoleResponse
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                CreatedAt = role.CreatedAt,
                UserCount = 0
            };
        }

        public async Task<RoleResponse?> UpdateAsync(long id, RoleRequest request)
        {
            var role = await _db.Roles.FindAsync(id);
            if (role == null) return null;

            role.RoleName = request.RoleName.Trim();
            await _db.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(long id)
        {
            var role = await _db.Roles.FindAsync(id);
            if (role == null)
                return (false, "Role tidak ditemukan");

            if (await _db.Users.AnyAsync(u => u.RoleId == id))
                return (false, "Role masih dipakai oleh user");

            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AssignRoleAsync(AssignRoleRequest request)
        {
            var user = await _db.Users.FindAsync(request.UserId);
            if (user == null)
                return (false, "User tidak ditemukan");

            if (!await _db.Roles.AnyAsync(r => r.RoleId == request.RoleId))
                return (false, "Role tidak ditemukan");

            user.RoleId = request.RoleId;
            await _db.SaveChangesAsync();
            return (true, null);
        }

    }
}