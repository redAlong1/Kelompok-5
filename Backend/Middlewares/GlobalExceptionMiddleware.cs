using System.Net;

namespace AdinsLibrary.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext ctx)
        {
            try
            {
                await _next(ctx);
            }
            catch (Exception ex)
            {
                // ✅ LOG error lengkap (muncul di console/file)
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                // ✅ Di Development: tampilkan detail error
                // ✅ Di Production: pesan generik saja
                var response = _env.IsDevelopment()
                    ? new
                    {
                        status = "error",
                        message = ex.Message,
                        detail = ex.InnerException?.Message,
                        stackTrace = ex.StackTrace
                    }
                    : new
                    {
                        status = "error",
                        message = "Terjadi kesalahan server."
                    };

                await ctx.Response.WriteAsJsonAsync(response);
            }
        }
    }
}