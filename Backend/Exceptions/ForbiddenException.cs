namespace AdinsLibrary.Exceptions
{
    /// <summary>
    /// Dilempar ketika user tidak punya izin untuk mengakses resource (HTTP 403).
    /// </summary>
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message = "Anda tidak memiliki izin untuk melakukan aksi ini.")
            : base(message) { }
    }
}
