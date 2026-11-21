using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
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

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] BookReservationStatus? status)
        {
            var result = await _service.GetAllAsync(status);
            return Ok(result);
        }

        private long GetUserId()
        {
            var claim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return long.Parse(claim ?? "0");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookReservationRequest request)
        {
            var userId = GetUserId();
            if (userId <= 0)
                return Unauthorized(new { status = "error", message = "User tidak valid." });

            var result = await _service.CreateAsync(request, userId);
            if (result is null)
                return BadRequest(new { status = "error", message = "Buku tidak ditemukan" });

            return CreatedAtAction(nameof(GetById), new { id = result.BookReservationId }, result);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyReservations()
        {
            var userId = GetUserId();
            if (userId <= 0)
                return Unauthorized(new { status = "error", message = "User tidak valid." });

            var result = await _service.GetMyReservationsAsync(userId);
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

        [HttpPatch("{id:long}/complete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Complete(long id)
        {
            var ok = await _service.CompleteAsync(id);
            if (!ok) return NotFound();
            return Ok(new { status = "success", message = "Reservasi selesai" });
        }

        [HttpPatch("{id:long}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(long id)
        {
            var ok = await _service.RejectAsync(id);
            if (!ok) return NotFound(new { status = "error", message = "Reservasi tidak ditemukan atau sudah tidak aktif." });
            return Ok(new { status = "success", message = "Reservasi ditolak." });
        }
    }
}
