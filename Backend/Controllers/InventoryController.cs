using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] long? bookId)
        {
            var result = await _inventoryService.GetAllAsync(bookId);
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _inventoryService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Inventory dengan ID {id} tidak ditemukan." });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateInventoryRequest request)
        {
            try
            {
                var created = await _inventoryService.CreateAsync(request);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateInventoryRequest request)
        {
            try
            {
                var updated = await _inventoryService.UpdateAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Inventory dengan ID {id} tidak ditemukan." });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var deleted = await _inventoryService.DeleteAsync(id);
                if (deleted == null)
                    return NotFound(new { message = $"Inventory dengan ID {id} tidak ditemukan." });

                return Ok(deleted);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
