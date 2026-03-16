const DEFAULT_API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 30000;

export const AUTH_TOKEN_KEY = "agroaid_auth_token";
export const AUTH_USER_KEY = "agroaid_auth_user";

function withTimeoutSignal() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return { controller, timeoutId };
}

async function parseError(response, fallback) {
  try {
    const errorData = await response.json();
    if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
      return errorData.detail[0]?.msg || fallback;
    }
    return errorData.detail || fallback;
  } catch {
    return fallback;
  }
}

async function postJson(path, payload) {
  const { controller, timeoutId } = withTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response, "auth.errors.requestFailed"));
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("auth.errors.timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistAuth(accessToken, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearPersistedAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function registerWithPhone(payload) {
  return postJson("/auth/register", payload);
}

export async function loginWithPhone(payload) {
  return postJson("/auth/login", payload);
}

export async function getCurrentUser(token) {
  const { controller, timeoutId } = withTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response, "auth.errors.invalidToken"));
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("auth.errors.timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
