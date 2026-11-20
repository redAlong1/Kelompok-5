using AdinsLibrary.Models;

namespace AdinsLibrary.DTOs
{
    public class InventoryResponse
    {
        public long InventoryId { get; set; }
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string? BookIsbn { get; set; }
        public string ShelfLocation { get; set; } = string.Empty;
        public AvailabilityStatus AvailabilityStatus { get; set; }
        public string StatusName => AvailabilityStatus.ToString();
    }
}
