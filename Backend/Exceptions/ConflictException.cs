namespace AdinsLibrary.Exceptions
{
    /// <summary>
    /// Dilempar ketika terjadi konflik data, misalnya duplikasi (HTTP 409).
    /// </summary>
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}
