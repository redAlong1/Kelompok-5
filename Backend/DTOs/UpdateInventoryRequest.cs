using System.ComponentModel.DataAnnotations;
using AdinsLibrary.Models;

namespace AdinsLibrary.DTOs
{
    public class UpdateInventoryRequest
    {
        [MaxLength(100, ErrorMessage = "ShelfLocation maksimal 100 karakter.")]
        public string ShelfLocation { get; set; } = string.Empty;

        public AvailabilityStatus AvailabilityStatus { get; set; }
    }
}
