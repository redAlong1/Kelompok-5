namespace AdinsLibrary.DTOs
{
    public class RoleResponse
    {
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserCount { get; set; }
    }
}