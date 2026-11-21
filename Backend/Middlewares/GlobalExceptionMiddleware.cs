using AdinsLibrary.Exceptions;
using System.Net;

namespace AdinsLibrary.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext ctx)
        {
            try
            {
                await _next(ctx);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource tidak ditemukan: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.NotFound;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (ConflictException ex)
            {
                _logger.LogWarning(ex, "Konflik data: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.Conflict;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (BadRequestException ex)
            {
                _logger.LogWarning(ex, "Bad request: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning(ex, "Akses ditolak: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.Forbidden;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (UnauthorizedException ex)
            {
                _logger.LogWarning(ex, "Tidak terautentikasi: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.Unauthorized;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Operasi tidak valid: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argumen tidak valid: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                ctx.Response.ContentType = "application/json";
                ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                await ctx.Response.WriteAsJsonAsync(new
                {
                    status = "error",
                    message = "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
                    innerException = ex.InnerException?.Message
                });
            }
        }
    }
}
