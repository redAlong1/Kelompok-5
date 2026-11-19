namespace AdinsLibrary.DTOs
{
    public class AuthorResponse
    {
        public long AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
