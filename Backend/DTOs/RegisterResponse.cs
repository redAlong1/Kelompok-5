namespace AdinsLibrary.DTOs
{
    public class RegisterResponse
    {
        public string Status { get; set; } = "success";
        public string Message { get; set; } = "Registrasi berhasil. Silakan login.";
        public UserSummary User { get; set; } = new();
    }
}
