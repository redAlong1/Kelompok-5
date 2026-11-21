using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class MembershipTier
    {
        [Key]
        public long MembershipTierId { get; set; }
        [Required]
        [MaxLength(100)]
        public string TierName { get; set; } = string.Empty;
        [Column(TypeName = "decimal(5,2)")]
        public decimal Discount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int MinPoints { get; set; }
        public int MaxBorrowItems { get; set; } = 3;
        public int BorrowDurationDays { get; set; } = 14;
        public ICollection<User> Users { get; set; } = new List<User>();

    }
}
