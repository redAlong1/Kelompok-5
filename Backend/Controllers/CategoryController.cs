using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/category")]
    public class CategoryController : ControllerBase
    {

        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _categoryService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _categoryService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Category dengan ID {id} tidak ditemukan." });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CategoryRequest request)
        {
            try
            {
                var created = await _categoryService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(long id, [FromBody] CategoryRequest request)
        {
            try
            {
                var updated = await _categoryService.UpdateAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Category dengan ID {id} tidak ditemukan." });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _categoryService.DeleteAsync(id);
            if (deleted == null)
                return NotFound(new { message = $"Category dengan ID {id} tidak ditemukan." });

            return Ok(deleted);
        }
    }
}
