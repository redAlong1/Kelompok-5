using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Category
    {
        [Key]
        public long CategoryId { get; set; }
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set;} = string.Empty;
        [MaxLength(200)]
        public string Description { get; set;} = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
