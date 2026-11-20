using AdinsLibrary.Models;
using AdinsLibrary.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IRepository<User> _userRepo;

        public UsersController(IRepository<User> userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepo.GetAllAsync();
            var result = users.Select(u => new
            {
                u.UserId,
                u.Username,
                u.Email,
                Role = u.Role.ToString()
            }).OrderBy(u => u.Username).ToList();

            return Ok(result);
        }
    }
}
