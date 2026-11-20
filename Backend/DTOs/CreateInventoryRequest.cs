using System.ComponentModel.DataAnnotations;
using AdinsLibrary.Models;

namespace AdinsLibrary.DTOs
{
    public class CreateInventoryRequest
    {
        [Required(ErrorMessage = "BookId wajib diisi.")]
        public long BookId { get; set; }

        [MaxLength(100, ErrorMessage = "ShelfLocation maksimal 100 karakter.")]
        public string ShelfLocation { get; set; } = string.Empty;

        [Range(1, 100, ErrorMessage = "Quantity minimal 1 dan maksimal 100.")]
        public int Quantity { get; set; } = 1;

        public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.AVAILABLE;
    }
}
