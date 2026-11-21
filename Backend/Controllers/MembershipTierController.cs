using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/member-tier")]
    public class MembershipTierController : ControllerBase
    {
        private readonly IMembershipTierService _tierService;

        public MembershipTierController(IMembershipTierService tierService)
        {
            _tierService = tierService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tierService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _tierService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Member Tier dengan ID {id} tidak ditemukan." });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MembershipTierRequest request)
        {
            try
            {
                var created = await _tierService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.MembershipTierId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] MembershipTierRequest request)
        {
            try
            {
                var updated = await _tierService.UpdateAsync(id, request);
                if (updated == null)
                    return NotFound(new { message = $"Member Tier dengan ID {id} tidak ditemukan." });

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
            try
            {
                var deleted = await _tierService.DeleteAsync(id);
                if (deleted == null)
                    return NotFound(new { message = $"Member Tier dengan ID {id} tidak ditemukan." });

                return Ok(deleted);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
