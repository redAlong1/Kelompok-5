namespace AdinsLibrary.DTOs
{
    public class FineResponse
    {
        public long FineId { get; set; }
        public long BorrowingItemId { get; set; }
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string FineType { get; set; } = string.Empty;
        public decimal BaseAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Amount { get; set; }
        public string FineStatus { get; set; } = string.Empty;
        public DateTime? PaidDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AccruingFineResponse
    {
        public long BorrowingItemId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public DateOnly DueDate { get; set; }
        public int LateDays { get; set; }
        public decimal EstimatedAmount { get; set; }
        public bool IsEstimate { get; set; } = true; // bukan tagihan resmi
    }
}