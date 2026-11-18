using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Inventory
    {
        [Key]
        public long InventoryId { get; set; }
        [Required]
        public long BookId { get; set; }
        [Required]
        public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.AVAILABLE;
        public ICollection<Book> Books { get; set; } = new List<Book>();

    }
}
