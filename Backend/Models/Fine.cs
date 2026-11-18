using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class Fine
    {
        public long FineId { get; set; }
        [Required]
        public long BorrowingItemId { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        decimal BaseAmount { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        decimal? DiscountAmout { get; set; }
        public FineStatus FineStatus { get; set; } = FineStatus.UNPAID;
        public DateTime? PaidDate { get; set; }
        public DateTime CreatedAt { get; set; } 
    }
}
