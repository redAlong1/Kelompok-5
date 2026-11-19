    using AdinsLibrary.DTOs;
    using AdinsLibrary.Models;
    using AdinsLibrary.Repositories;
    using Microsoft.IdentityModel.Tokens;
    using System.Globalization;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    namespace AdinsLibrary.Services
    {
        public class AuthService : IAuthService
        {
            private readonly IRepository<User> _userRepository;
            private readonly IConfiguration _config;
            private readonly IRepository<Role> _roleRepository;
            private readonly IRepository<MembershipTier> _tierRepository;


        public AuthService(IRepository<User> userRepository, IConfiguration config, IRepository<Role> roleRepository,
        IRepository<MembershipTier> tierRepository)
            {
                _userRepository = userRepository;
                _config = config;
                _roleRepository = roleRepository;
                _tierRepository = tierRepository;
            }

            public async Task<LoginResponse?> LoginAsync(LoginRequest request)
            {
                List<User> users = await _userRepository.GetAllAsync();
                User? user = users.FirstOrDefault(u => u.Email == request.Email);

                if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                    return null;

                Role? role = await _roleRepository.GetByIdAsync(user.RoleId);
                MembershipTier? tier = await _tierRepository.GetByIdAsync(user.MembershipTierId);



                Claim[] claims = new[]
                {
                    new Claim("userId", user.UserId.ToString()),
                    new Claim("email", user.Email),
                };

                SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
                SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                JwtSecurityToken token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpireMinutes"]!)),
                    signingCredentials: creds);

                return new LoginResponse
                {
                    status = "success",
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    User = new UserSummary
                    {
                        UserId = user.UserId,
                        UserName = user.Username,
                        Email = user.Email,
                        RoleName = role?.RoleName ?? string.Empty,               
                        MembershipTierName = tier?.TierName ?? string.Empty
                    }
                };
            }
            public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request)
            {
                List<User> users = await _userRepository.GetAllAsync();
                bool emailExists = users.Any(u => u.Email == request.Email);

                if (emailExists)
                    return null;   


                User user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    RoleId = 2,                // default: "Member"
                    MembershipTierId = 1,      // default: "Bronze"
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(user);
                await _userRepository.SaveChangesAsync();

                return new RegisterResponse
                {
                    Status = "success",
                    Message = "Registrasi berhasil. Silakan login.",
                    User = new UserSummary
                    {
                        UserId = user.UserId,
                        UserName = user.Username,
                        Email = user.Email,
                        RoleName = "Member", //hardcode
                        MembershipTierName = "Bronze" // hardcode
                    }
                };
            }
        }
    }
