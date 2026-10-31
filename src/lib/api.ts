// Typed fetch client for the existing Brightloop backend (src/app/api/v1/**)
// All responses follow { success: boolean, data?: T, error?: string } via lib/api-response.ts

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type Params = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, params?: Params) {
  const url = new URL(path, "http://local"); // base ignored; relative used by browser
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const qs = url.searchParams.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(path: string, init?: RequestInit & { params?: Params }): Promise<T> {
  const { params, ...rest } = init ?? {};
  const res = await fetch(buildUrl(path, params), {
    ...rest,
    credentials: "include",
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    cache: "no-store",
  });

  let json: ApiEnvelope<T> | null = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !json?.success) {
    const message =
      json?.error ||
      (res.status === 401
        ? "Your session has expired. Please sign in again."
        : `Request failed (${res.status})`);
    throw new ApiError(message, res.status, json?.details);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, params?: Params) => request<T>(path, { params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};

export interface AuthPrincipal {
  userId: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  name?: string | null;
  customerAccountId?: string | null;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: AuthPrincipal }>("/api/v1/auth/login", { email, password }),
  register: (body: { email: string; name: string; password: string }) =>
    api.post<{ user?: AuthPrincipal; message?: string }>("/api/v1/auth/register", body),
  me: () => api.get<{ user: AuthPrincipal }>("/api/v1/auth/me"),
  logout: () => api.post("/api/v1/auth/logout"),
  forgotPassword: (email: string) =>
    api.post<{ message?: string; resetToken?: string; resetUrl?: string; clearTextToken?: string }>(
      "/api/v1/auth/forgot-password", { email },
    ),
};

export type Role = AuthPrincipal["role"];
