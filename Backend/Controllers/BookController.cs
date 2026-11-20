//using AdinsLibrary.DTOs;
//using AdinsLibrary.Models;
//using AdinsLibrary.Services;
//using Microsoft.AspNetCore.Mvc;

//namespace AdinsLibrary.Controllers
//{
//    [ApiController]
//    [Route("api/book")]
//    public class BookController : ControllerBase
//    {
//        private readonly IBookService _bookService;
        
//        public BookController (IBookService bookService)
//        {
//            _bookService = bookService;
//        }

//        [HttpGet]
//        public async Task<ActionResult<Book>> GetAll([FromQuery] GetBooksQuery query)
//        {
//            var books = await _bookService.GetAllAsync(query ?? new GetBooksQuery());
//            return Ok(books);
//        }

//        [HttpGet("{id:long}")]
//        public async Task<ActionResult<Book>> GetById(long id)
//        {
//            if (id <= 0)
//                return BadRequest(new { message = "ID buku tidak valid." });

//            var book = await _bookService.GetByIdAsync(id);
//            if (book == null)
//                return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

//            return Ok(book);
//        }

//        [HttpPost]
//        public async Task<ActionResult<Book>> Create([FromBody] BookRequest book)
//        {
//            if (book == null)
//                return BadRequest(new { message = "Data buku tidak boleh kosong." });

//            try
//            {
//                var created = await _bookService.CreateBookAsync(book);
//                if (created == null)
//                    return BadRequest(new { message = "Gagal membuat data buku." });

//                return CreatedAtAction(nameof(GetById), new { id = created.BookId }, created);
//            }
//            catch (InvalidOperationException ex)
//            {
//                return BadRequest(new { message = ex.Message });
//            }
//        }

//        [HttpPut("{id:long}")]
//        public async Task<ActionResult<Book>> Update(long id, [FromBody] UpdateBookRequest book)
//        {
//            if (id <= 0)
//                return BadRequest(new { message = "ID buku tidak valid." });

//            if (book == null)
//                return BadRequest(new { message = "Data buku tidak boleh kosong." });

//            try
//            {
//                var updated = await _bookService.UpdateBookAsync(id, book);
//                if (updated == null)
//                    return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

//                return Ok(updated);
//            }
//            catch (InvalidOperationException ex)
//            {
//                return BadRequest(new { message = ex.Message });
//            }
//        }

//        [HttpDelete("{id:long}")]
//        public async Task<ActionResult<Book>> Delete(long id)
//        {
//            if (id <= 0)
//                return BadRequest(new { message = "ID buku tidak valid." });

//            try
//            {
//                var deleted = await _bookService.DeleteBookAsync(id);
//                if (deleted == null)
//                    return NotFound(new { message = $"Buku dengan ID {id} tidak ditemukan." });

//                return Ok(deleted);
//            }
//            catch (InvalidOperationException ex)
//            {
//                return BadRequest(new { message = ex.Message });
//            }
//        }
//    }
//}
