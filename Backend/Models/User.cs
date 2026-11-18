using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class User
    {
        [Key]
        public long UserId { get; set; }
        [Required]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string Password { get; set; } = string.Empty;
        [ForeignKey(nameof(Role))]
        public long RoleId { get; set; }
        public Role Role { get; set; } = null!;
        [ForeignKey(nameof(MembershipTier))]
        public long MembershipTierId { get; set; }
        public MembershipTier MembershipTier { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<BookBorrowingTransaction> BookBorrowingTransactions { get; set; } = new List<BookBorrowingTransaction>();
        public ICollection<BookReservation> BookReservations { get; set; } = new List<BookReservation>();

    }
}
