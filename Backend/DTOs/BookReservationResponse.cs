namespace AdinsLibrary.DTOs
{
    public class BookReservationResponse
    {
        public long BookReservationId { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public DateTime ReservationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
