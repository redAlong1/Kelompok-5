using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class MembershipTierRequest
    {
        [Required(ErrorMessage = "Nama tier wajib diisi.")]
        [MaxLength(100, ErrorMessage = "Nama tier maksimal 100 karakter.")]
        public string TierName { get; set; } = string.Empty;

        [Range(0, 100, ErrorMessage = "Diskon harus bernilai antara 0% hingga 100%.")]
        public decimal Discount { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "MinPoints minimal 0.")]
        public int MinPoints { get; set; }

        [Range(1, 100, ErrorMessage = "Maksimal buku yang dipinjam minimal 1.")]
        public int MaxBorrowItems { get; set; } = 3;

        [Range(1, 365, ErrorMessage = "Durasi peminjaman minimal 1 hari.")]
        public int BorrowDurationDays { get; set; } = 14;
    }
}
