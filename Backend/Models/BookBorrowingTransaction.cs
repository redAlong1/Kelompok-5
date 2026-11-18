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
        public User? User { get; set; }
        [Required]
        public BookBorrowingTransactionStatus BookTransactionStatus { get; set; } = BookBorrowingTransactionStatus.BORROWED;
        public DateOnly BorrowDate { get; set; }
        public DateOnly DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BorrowingItem> BorrowingItems { get; set; } = new List<BorrowingItem>();

    }
}

