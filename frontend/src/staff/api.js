export const API = "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status, hasMessage = true) {
    super(message);
    this.status = status;
    this.hasMessage = hasMessage;
  }
}

// True when the server rejected our token (expired, or wrong role).
export function isSessionError(error) {
  return (
    error instanceof ApiError &&
    (error.status === 401 || (error.status === 403 && !error.hasMessage))
  );
}

export async function api(path, { method = "GET", token, body } = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Is the backend running on port 8080?",
      0
    );
  }

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" && data.trim()) ||
      "";

    throw new ApiError(
      message || `Request failed (${response.status})`,
      response.status,
      Boolean(message)
    );
  }

  return data;
}

export function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Keeps the staff login in this browser tab only.
export function loadSession(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // storage blocked: the session just lasts until refresh
  }
}
