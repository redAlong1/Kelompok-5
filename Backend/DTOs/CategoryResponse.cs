namespace AdinsLibrary.DTOs
{
    public class CategoryResponse
    {
        public long CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
