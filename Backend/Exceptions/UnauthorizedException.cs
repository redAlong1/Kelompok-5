namespace AdinsLibrary.Exceptions
{
    /// <summary>
    /// Dilempar ketika user belum terautentikasi (HTTP 401).
    /// </summary>
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message = "Autentikasi diperlukan untuk mengakses resource ini.")
            : base(message) { }
    }
}
