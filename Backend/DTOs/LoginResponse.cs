namespace AdinsLibrary.DTOs
{
    public class LoginResponse
    {
        public string status { get; set; } = "success";
        public string Token { get; set; } = string.Empty;
        public UserSummary User { get; set; } = new();
    }

    public class UserSummary
    {
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string MembershipTierName { get; set; } = string.Empty;

        public int Points { get; set; }
        public int MaxBorrowItems { get; set; }
        public int BorrowDurationDays { get; set; }
        public string? NextTierName { get; set; }      // null kalau sudah tier tertinggi
        public int? NextTierMinPoints { get; set; }
    }
}