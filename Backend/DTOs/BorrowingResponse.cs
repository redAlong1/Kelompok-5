namespace AdinsLibrary.DTOs
{
    public class BorrowingItemResponse
    {
        public long BorrowingItemId { get; set; }
        public long InventoryId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string ShelfLocation { get; set; } = string.Empty;
        public DateTime? ReturnDate { get; set; }
        public string? ReturnCondition { get; set; }
        public int? LateDays { get; set; }
    }

    public class BorrowingResponse
    {
        public long BookBorrowingTransactionId { get; set; }
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateOnly BorrowDate { get; set; }
        public DateOnly DueDate { get; set; }
        public List<BorrowingItemResponse> Items { get; set; } = new();
    }

    public class ReturnResultResponse
    {
        public BorrowingResponse Borrowing { get; set; } = null!;
        public List<FineResponse> Fines { get; set; } = new();
    }
}