using System.ComponentModel.DataAnnotations;

namespace AdinsLibrary.Models
{
    public class Role
    {
        [Key]
        public long RoleId { get; set; }
        [Required]
        [MaxLength(200)]
        public string RoleName { get; set;}
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
