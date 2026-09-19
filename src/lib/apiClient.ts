/**
 * Centralized API Client Fetch Wrapper
 * Automatically handles JWT tokens from localStorage/cookies, credentials, Authorization Bearer headers,
 * and graceful session expiration redirects.
 */

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("apex_token") || null;
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("apex_token", token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("apex_token");
    localStorage.removeItem("apex_active_user");
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-apex-token"] = token;
  }

  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // Ensure cookies are sent on same-origin/cross-origin requests
    headers,
  };

  const response = await fetch(endpoint, fetchOptions);

  // Handle explicit session expiration if API returns 401 with TOKEN_EXPIRED code
  if (response.status === 401 && typeof window !== "undefined") {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (data?.code === "TOKEN_EXPIRED") {
        clearStoredToken();
        // Redirect to login page if user session is expired
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=1";
        }
      }
    } catch (e) {
      // Ignore clone parse errors
    }
  }

  return response;
}
