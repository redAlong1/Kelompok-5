namespace AdinsLibrary.Exceptions
{
    /// <summary>
    /// Dilempar ketika request tidak valid secara bisnis (HTTP 400).
    /// </summary>
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }
}
