using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace AdinsLibrary.Models
{
    public class Book
    {
        [Key]
        public long BookId { get; set; }
        [MaxLength(500)]
        public string? CoverUrl { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        [MaxLength(20)]
        public string Isbn { get; set; }
        [ForeignKey(nameof(Author))]
        public long AuthorId { get; set; }
        public Author? Author { get; set; }
        [ForeignKey(nameof(Category))]
        public long CategoryId { get; set; }
        public Category? Category { get; set; }
        [ForeignKey(nameof(Publisher))]
        public long PublisherId { get; set; }
        public Publisher? Publisher { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
        public ICollection<BookReservation> BookReservations { get; set; } = new List<BookReservation>();

    }
}
