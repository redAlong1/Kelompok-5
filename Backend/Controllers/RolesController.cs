using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/roles")]
    [Authorize(Roles = "Admin")]   // semua endpoint di sini hanya untuk Admin
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _roleService.GetAllAsync());

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var role = await _roleService.GetByIdAsync(id);
            if (role == null)
                return NotFound(new { status = "error", message = "Role tidak ditemukan" });
            return Ok(role);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RoleRequest request)
        {
            var role = await _roleService.CreateAsync(request);
            if (role == null)
                return BadRequest(new { status = "error", message = "Nama role sudah ada" });
            return CreatedAtAction(nameof(GetById), new { id = role.RoleId }, role);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] RoleRequest request)
        {
            var role = await _roleService.UpdateAsync(id, request);
            if (role == null)
                return NotFound(new { status = "error", message = "Role tidak ditemukan" });
            return Ok(role);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var (success, error) = await _roleService.DeleteAsync(id);
            if (!success)
                return BadRequest(new { status = "error", message = error });
            return NoContent();
        }

        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] AssignRoleRequest request)
        {
            var (success, error) = await _roleService.AssignRoleAsync(request);
            if (!success)
                return BadRequest(new { status = "error", message = error });
            return Ok(new { status = "success", message = "Role user berhasil diubah" });
        }
    }
}