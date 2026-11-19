using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class AuthorRequest
    {
        [Required(ErrorMessage = "AuthorName wajib diisi.")]
        [MaxLength(255, ErrorMessage = "AuthorName maksimal 255 karakter.")]
        public string AuthorName { get; set; } = string.Empty;
    }
}
