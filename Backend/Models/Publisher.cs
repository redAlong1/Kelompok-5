using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Publisher
    {
        [Key]

        public long PublisherId { get; set; }

        public string PublisherName { get; set; } = string.Empty;

        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
