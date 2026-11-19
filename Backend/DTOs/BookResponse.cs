namespace AdinsLibrary.DTOs
{
    public class BookResponse
    {
        public long BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Isbn { get; set; }
        public string? CoverUrl { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }

        public long AuthorId { get; set; }
        public BookAuthorDto? Author { get; set; }

        public long CategoryId { get; set; }
        public BookCategoryDto? Category { get; set; }

        public long PublisherId { get; set; }
        public BookPublisherDto? Publisher { get; set; }

        public int TotalStock { get; set; }
        public int AvailableStock { get; set; }
        public List<BookInventoryDto> Inventories { get; set; } = new List<BookInventoryDto>();
    }

    public class BookAuthorDto
    {
        public long AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }

    public class BookCategoryDto
    {
        public long CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class BookPublisherDto
    {
        public long PublisherId { get; set; }
        public string PublisherName { get; set; } = string.Empty;
    }

    public class BookInventoryDto
    {
        public long InventoryId { get; set; }
        public string AvailabilityStatus { get; set; } = string.Empty;
    }
}

