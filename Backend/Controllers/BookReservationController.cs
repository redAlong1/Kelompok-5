using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/reservations")]
    [Authorize]
    public class BookReservationController : ControllerBase
    {
        private readonly IBookReservationService _service;

        public BookReservationController(IBookReservationService service)
        {
            _service = service;
        }

        private long GetUserId()
        {
            var claim = User.FindFirst("userId")?.Value;
            return long.Parse(claim ?? "0");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookReservationRequest request)
        {
            var result = await _service.CreateAsync(request, GetUserId());
            if (result is null)
                return BadRequest(new { status = "error", message = "Buku tidak ditemukan" });
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result is null) return NotFound();
            return Ok(result);
        }

        [HttpPatch("{id:long}/cancel")]
        public async Task<IActionResult> Cancel(long id)
        {
            var ok = await _service.CancelAsync(id, GetUserId());
            if (!ok) return NotFound();
            return Ok(new { status = "success", message = "Reservasi dibatalkan" });
        }
    }
}