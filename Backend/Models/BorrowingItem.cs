using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection.Metadata.Ecma335;

namespace AdinsLibrary.Models
{
    public class BorrowingItem
    {
        [Key]
        public long BorrowingItemId { get; set; }
        [ForeignKey(nameof(BookBorrowingTransaction))]
        [Required]
        public long BookBorrowingTransactionId { get; set; }
        public BookBorrowingTransaction BookBorrowingTransaction { get; set; }
        [Required]
        [ForeignKey(nameof(Inventory))]
        public long InventoryId { get; set; }
        public Inventory? Inventory { get; set; }
        public DateTime? ReturnDate { get; set; }
        public BookCondition? ReturnCondition { get; set; }
        public int? LateDays { get; set; }
        public ICollection<Fine> Fines { get; set; } = new List<Fine>();

    }
}
