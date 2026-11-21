export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      '=',
    );
    const payload = JSON.parse(atob(padded));

    if (!payload.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return Number(payload.exp) <= nowInSeconds;
  } catch {
    return true;
  }
}
