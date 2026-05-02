// src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Central fetch wrapper. Reads the JWT from localStorage and injects it as
// Authorization: Bearer <token> on every request automatically.
// Usage:
//   import { apiFetch } from "../utils/api";
//   const data = await apiFetch("/dashboard/");
//   const data = await apiFetch("/upload/", { method: "POST", body: formData });
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Don't set Content-Type for FormData — browser must set boundary automatically
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // If 401, token is expired/invalid — bounce to login
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }

  return res;
}
