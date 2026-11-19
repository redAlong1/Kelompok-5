using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.DTOs
{
    public class RoleRequest
    {
        [Required]
        [MaxLength(200)]
        public string RoleName { get; set; } = string.Empty;
    }

    public class AssignRoleRequest
    {
        [Required]
        public long UserId { get; set; }

        [Required]
        public long RoleId { get; set; }
    }
}