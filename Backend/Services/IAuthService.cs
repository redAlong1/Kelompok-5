using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        Task<RegisterResponse?> RegisterAsync(RegisterRequest request);
        Task<UserSummary?> GetProfileAsync(long userId);
    }
}
