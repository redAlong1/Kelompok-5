using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace AdinsLibrary.Models
{
    public class Book
    {
        [Key]

        public long BookId { get; set; }
        public string Title { get; set; }
        public string Isbn { get; set; }

        [ForeignKey(nameof(Author))]
        public long AuthorId { get; set; }
        public Author? Author { get; set; }

        [ForeignKey(nameof(Category))]
        public long CategoryId { get; set; }
        public Category? Category { get; set; }

        [ForeignKey(nameof(Publisher))]
        public long PublisherId { get; set; }
        public Publisher? Publisher { get; set;}

        public string Description { get; set; }

    }
}
