namespace AdinsLibrary.DTOs
{
    public class MembershipTierResponse
    {
        public long MembershipTierId { get; set; }
        public string TierName { get; set; } = string.Empty;
        public decimal Discount { get; set; }
        public int MinPoints { get; set; }
        public int MaxBorrowItems { get; set; }
        public int BorrowDurationDays { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalUsers { get; set; }
    }
}
