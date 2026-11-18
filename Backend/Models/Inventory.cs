using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class Inventory
    {
        [Key]
        public long InventoryId { get; set; }
        [Required]
        [ForeignKey(nameof(Book))]
        public long BookId { get; set; }
        [Required]
        public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.AVAILABLE;
        public ICollection<Book> Books { get; set; } = new List<Book>();

    }
}
