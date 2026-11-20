using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Publisher
    {
        [Key]
        public long PublisherId { get; set; }
        [Required]
        [MaxLength(255)]
        public string PublisherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
