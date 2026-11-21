using AdinsLibrary.Models;
using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class BorrowRequest
    {
        [Required(ErrorMessage = "UserId wajib diisi.")]
        [Range(1, long.MaxValue, ErrorMessage = "UserId tidak valid.")]
        public long UserId { get; set; }

        [Required(ErrorMessage = "InventoryIds wajib diisi.")]
        [MinLength(1, ErrorMessage = "Pilih minimal satu buku.")]
        public List<long> InventoryIds { get; set; } = new();
    }

    public class ReturnItemRequest
    {
        [Required(ErrorMessage = "BorrowingItemId wajib diisi.")]
        [Range(1, long.MaxValue, ErrorMessage = "BorrowingItemId tidak valid.")]
        public long BorrowingItemId { get; set; }

        [Required(ErrorMessage = "Condition wajib diisi.")]
        public BookCondition Condition { get; set; }
    }

    public class ReturnRequest
    {
        [Required(ErrorMessage = "Items wajib diisi.")]
        [MinLength(1, ErrorMessage = "Pilih minimal satu item yang dikembalikan.")]
        public List<ReturnItemRequest> Items { get; set; } = new();
    }
}
