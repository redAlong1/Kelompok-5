using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

}
