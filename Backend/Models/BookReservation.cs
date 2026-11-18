using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdinsLibrary.Models
{
    public class BookReservation
    {
        [Key]
        public long BookReservationId {  get; set; }
        [ForeignKey(nameof(User))]
        [Required]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(Book))]
        [Required]
        public long BookId { get; set; }
        public Book Book { get; set; } = null!;
        public DateTime ReservationDate { get; set; }
        public BookReservationStatus BookReservationStatus { get; set; } = BookReservationStatus.ACTIVE;
        public DateTime CreatedAt { get; set; }
    }
}
