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
            var users = await _userRepo.GetAllAsync(nameof(AdinsLibrary.Models.User.MembershipTier));
            var result = users.Select(u => new
            {
                u.UserId,
                u.Username,
                u.Email,
                Role = u.Role.ToString(),
                u.MembershipTierId,
                MembershipTier = u.MembershipTier == null ? null : new
                {
                    u.MembershipTier.MembershipTierId,
                    u.MembershipTier.TierName,
                    u.MembershipTier.BorrowDurationDays,
                    u.MembershipTier.MaxBorrowItems,
                    u.MembershipTier.Discount,
                    u.MembershipTier.MinPoints
                },
                BorrowDurationDays = u.MembershipTier?.BorrowDurationDays ?? 14
            }).OrderBy(u => u.Username).ToList();

            return Ok(result);
        }
    }
}