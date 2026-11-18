using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Author
    {
        [Key]
        public long AuthorId { get; set; }
        [Required]
        [MaxLength(255)]
        public string AuthorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Book> Books { get; set; } = new List<Book>();

    }
}
