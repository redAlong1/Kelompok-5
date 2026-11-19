namespace AdinsLibrary.DTOs
{
    public class PublisherResponse
    {
        public long PublisherId { get; set; }
        public string PublisherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
