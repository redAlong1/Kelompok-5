using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{

    [ApiController]
    [Route("api/author")]
    public class AuthorsController : ControllerBase
    {
        private readonly IAuthorService _authorService;

        public AuthorsController(IAuthorService authorService)
        {
            _authorService = authorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _authorService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _authorService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Author dengan ID {id} tidak ditemukan." });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AuthorRequest request)
        {
            try
            {
                var created = await _authorService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.AuthorId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] AuthorRequest request)
        {
            try
            {
                var updated = await _authorService.UpdateAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Author dengan ID {id} tidak ditemukan." });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _authorService.DeleteAsync(id);
            if (deleted == null)
                return NotFound(new { message = $"Author dengan ID {id} tidak ditemukan." });

            return Ok(deleted);
        }
    }
}
