using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class PublisherRequest
    {
        [Required(ErrorMessage = "PublisherName wajib diisi.")]
        [MaxLength(255, ErrorMessage = "PublisherName maksimal 255 karakter.")]
        public string PublisherName { get; set; } = string.Empty;
    }
}
