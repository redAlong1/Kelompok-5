using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class Fine
    {
        [Key]
        public long FineId { get; set; }
        [Required]
        [ForeignKey(nameof(BorrowingItem))]
        public long BorrowingItemId { get; set; }
        public BorrowingItem? BorrowingItem { get; set; }
        [Required]
        public FineType FineType { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal BaseAmount { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountAmount { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }
        public FineStatus FineStatus { get; set; } = FineStatus.UNPAID;
        public DateTime? PaidDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}