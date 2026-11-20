using AdinsLibrary.Models;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/fines")]
    public class FinesController : ControllerBase
    {
        private readonly IFineService _fineService;

        public FinesController(IFineService fineService)
        {
            _fineService = fineService;
        }

        // ADMIN: semua denda, bisa difilter ?status=UNPAID&type=LATE
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] FineStatus? status, [FromQuery] FineType? type)
            => Ok(await _fineService.GetAllAsync(status, type));

        // USER: denda milik sendiri
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            long? userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _fineService.GetByUserAsync(userId.Value));
        }

        // USER: estimasi denda berjalan (buku belum kembali & lewat tempo)
        [HttpGet("me/accruing")]
        [Authorize]
        public async Task<IActionResult> GetMyAccruing()
        {
            long? userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _fineService.GetAccruingAsync(userId.Value));
        }

        [HttpGet("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(long id)
        {
            var fine = await _fineService.GetByIdAsync(id);
            if (fine == null)
                return NotFound(new { status = "error", message = "Denda tidak ditemukan" });
            return Ok(fine);
        }

        // ADMIN: tandai lunas
        [HttpPost("{id:long}/pay")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Pay(long id)
        {
            var (success, error) = await _fineService.MarkAsPaidAsync(id);
            if (!success)
                return BadRequest(new { status = "error", message = error });
            return Ok(new { status = "success", message = "Denda ditandai lunas" });
        }

        // SEMENTARA untuk tes di Swagger. Nanti dipanggil oleh service pengembalian,
        // lalu endpoint ini bisa dihapus.
        [HttpPost("generate/{borrowingItemId:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Generate(long borrowingItemId)
        {
            var (fines, error) = await _fineService.CreateFinesForReturnAsync(borrowingItemId);
            if (fines == null)
                return BadRequest(new { status = "error", message = error });
            return Ok(fines);
        }

        private long? GetUserId()
        {
            string? raw = User.FindFirst("userId")?.Value;
            return long.TryParse(raw, out long id) ? id : null;
        }
    }
}