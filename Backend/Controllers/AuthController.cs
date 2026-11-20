using AdinsLibrary.DTOs;
using AdinsLibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdinsLibrary.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            LoginResponse? result = await _authService.LoginAsync(request);
            if (result == null)
                return Unauthorized(new { status = "error", message = "Email atau Password Salah"});
            return Ok(result); 
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            RegisterResponse? result = await _authService.RegisterAsync(request);

            if (result == null)
                return BadRequest(new { status = "error", message = "Email sudah terdaftar" });

            return Ok(result);
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            if (!long.TryParse(User.FindFirst("userId")?.Value, out long userId))
                return Unauthorized();

            var profile = await _authService.GetProfileAsync(userId);
            return profile == null ? NotFound() : Ok(profile);
        }

    }
}
