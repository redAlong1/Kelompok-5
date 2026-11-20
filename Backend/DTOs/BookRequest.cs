using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class BookRequest
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Isbn { get; set; }

        [StringLength(500)]
        public string? CoverUrl { get; set; }

        [Range(0, 1000000000, ErrorMessage = "Price harus lebih besar atau sama dengan 0.")]
        public decimal Price { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "AuthorId tidak valid.")]
        public int AuthorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "CategoryId tidak valid.")]
        public int CategoryId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PublisherId tidak valid.")]
        public int PublisherId { get; set; }
    }

    public class UpdateBookRequest : BookRequest
    {
    }
}
