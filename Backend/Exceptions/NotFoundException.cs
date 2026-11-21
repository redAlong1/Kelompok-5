namespace AdinsLibrary.Exceptions
{
    /// <summary>
    /// Dilempar ketika resource yang dicari tidak ditemukan (HTTP 404).
    /// </summary>
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }

        public NotFoundException(string resourceName, object key)
            : base($"{resourceName} dengan ID '{key}' tidak ditemukan.") { }
    }
}
