using AdinsLibrary.DTOs;
using AdinsLibrary.Models;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/book")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IWebHostEnvironment _env;

        public BookController(IBookService bookService, IWebHostEnvironment env )
        {
            _bookService = bookService;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<Book>> GetAll()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books);
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<Book>> GetById(long id)
        {
            if (id <= 0)
                return BadRequest(new { message = "ID buku tidak valid." });

            var book = await _bookService.GetByIdAsync(id);
            if (book == null)
                return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

            return Ok(book);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Book>> Create([FromBody] BookRequest book)
        {
            if (book == null)
                return BadRequest(new { message = "Data buku tidak boleh kosong." });

            try
            {
                var created = await _bookService.CreateBookAsync(book);
                if (created == null)
                    return BadRequest(new { message = "Gagal membuat data buku." });

                return CreatedAtAction(nameof(GetById), new { id = created.BookId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Book>> Update(long id, [FromBody] UpdateBookRequest book)
        {
            if (id <= 0)
                return BadRequest(new { message = "ID buku tidak valid." });

            if (book == null)
                return BadRequest(new { message = "Data buku tidak boleh kosong." });

            try
            {
                var updated = await _bookService.UpdateBookAsync(id, book);
                if (updated == null)
                    return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Book>> Delete(long id)
        {
            if (id <= 0)
                return BadRequest(new { message = "ID buku tidak valid." });

            try
            {
                var deleted = await _bookService.DeleteBookAsync(id);
                if (deleted == null)
                    return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

                return Ok(deleted);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("upload-cover")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadCover([FromForm] IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File gambar tidak boleh kosong." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Format file tidak didukung. Harap unggah format JPG, PNG, WEBP, atau GIF." });

            const long maxFileSize = 5 * 1024 * 1024; // 5 MB
            if (file.Length > maxFileSize)
                return BadRequest(new { message = "Ukuran gambar tidak boleh melebihi 5 MB." });

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "covers");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"cover_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
            var destinationPath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(destinationPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/covers/{uniqueFileName}";
            return Ok(new
            {
                url = relativeUrl,
                fileName = uniqueFileName,
                message = "Cover buku berhasil diunggah."
            });
        }
    }
}
