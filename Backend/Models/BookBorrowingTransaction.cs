using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class BookBorrowingTransaction
    {
        [Key]
        public long BookBorrowingTransactionId { get; set; }
        [ForeignKey(nameof(User))]
        public long UserId { get; set; }
        [Required]
        public BookBorrowingTransactionStatus Status { get; set; } = BookBorrowingTransactionStatus.BORROWED;
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BorrowingItem> BorrowingItems { get; set; } = new List<BorrowingItem>();
    }
}

