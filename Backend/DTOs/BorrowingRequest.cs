using AdinsLibrary.Models;
using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class BorrowRequest
    {
        [Required]
        public long UserId { get; set; }

        [Required]
        public List<long> InventoryIds { get; set; } = new();
    }

    public class ReturnItemRequest
    {
        [Required]
        public long BorrowingItemId { get; set; }

        [Required]
        public BookCondition Condition { get; set; }
    }

    public class ReturnRequest
    {
        [Required]
        public List<ReturnItemRequest> Items { get; set; } = new();
    }
}