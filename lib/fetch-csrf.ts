/**
 * Read the CSRF token from the cookie and return headers
 * that should be merged into every state-changing fetch call.
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Wrapper around fetch that automatically injects the CSRF header
 * for POST / PATCH / PUT / DELETE requests.
 */
export async function csrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);

  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    const token = getCsrfToken();
    if (token) {
      headers.set("x-csrf-token", token);
    }
  }

  return fetch(input, { ...init, headers });
}
