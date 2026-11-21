using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class CreateBookReservationRequest
    {
        [Required(ErrorMessage = "BookId wajib diisi.")]
        [Range(1, long.MaxValue, ErrorMessage = "BookId tidak valid.")]
        public long BookId { get; set; }

        [MaxLength(500, ErrorMessage = "Notes maksimal 500 karakter.")]
        public string? Notes { get; set; }
    }
}
