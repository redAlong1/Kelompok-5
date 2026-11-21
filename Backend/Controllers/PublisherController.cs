using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublishersController : ControllerBase
    {
        private readonly IPublisherService _publisherService;

        public PublishersController(IPublisherService publisherService)
        {
            _publisherService = publisherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _publisherService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _publisherService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Publisher dengan ID {id} tidak ditemukan." });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] PublisherRequest request)
        {
            try
            {
                var created = await _publisherService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.PublisherId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(long id, [FromBody] PublisherRequest request)
        {
            try
            {
                var updated = await _publisherService.UpdateAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Publisher dengan ID {id} tidak ditemukan." });

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
            var deleted = await _publisherService.DeleteAsync(id);
            if (deleted == null)
                return NotFound(new { message = $"Publisher dengan ID {id} tidak ditemukan." });

            return Ok(deleted);
        }
    }
}
