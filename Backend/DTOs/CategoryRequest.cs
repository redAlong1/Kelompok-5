using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class CategoryRequest
    {
        [Required(ErrorMessage = "CategoryName wajib diisi.")]
        [MaxLength(100, ErrorMessage = "CategoryName maksimal 100 karakter.")]
        public string CategoryName { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "Description maksimal 200 karakter.")]
        public string? Description { get; set; }
    }
}
