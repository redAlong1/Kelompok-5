using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/borrowings")]
    public class BorrowingsController : ControllerBase
    {
        private readonly IBookBorrowingTransactionService _service;

        public BorrowingsController(IBookBorrowingTransactionService service)
        {
            _service = service;
        }

        // ADMIN: semua transaksi, filter ?status=BORROWED
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] BookBorrowingTransactionStatus? status)
            => Ok(await _service.GetAllAsync(status));

        // USER: riwayat peminjaman sendiri
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            long? userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _service.GetByUserAsync(userId.Value));
        }

        // Admin boleh melihat semua, user hanya miliknya sendiri
        [HttpGet("{id:long}")]
        [Authorize]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { status = "error", message = "Transaksi tidak ditemukan" });

            if (!User.IsInRole("Admin") && result.UserId != GetUserId())
                return Forbid();

            return Ok(result);
        }

        // ADMIN: proses peminjaman
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Borrow([FromBody] BorrowRequest request)
        {
            var (result, error) = await _service.BorrowAsync(request);
            if (result == null)
                return BadRequest(new { status = "error", message = error });
            return CreatedAtAction(nameof(GetById),
                new { id = result.BookBorrowingTransactionId }, result);
        }

        // ADMIN: proses pengembalian + pilih kondisi tiap buku
        [HttpPost("{id:long}/return")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Return(long id, [FromBody] ReturnRequest request)
        {
            var (result, error) = await _service.ReturnAsync(id, request);
            if (result == null)
                return BadRequest(new { status = "error", message = error });
            return Ok(result);
        }

        private long? GetUserId()
        {
            string? raw = User.FindFirst("userId")?.Value;
            return long.TryParse(raw, out long id) ? id : null;
        }
    }
}