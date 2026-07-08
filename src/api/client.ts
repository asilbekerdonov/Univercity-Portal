import type {
  LoginRequest,
  LoginSuccessResponse,
  LoginValidationErrorResponse,
} from "../types";

// Base URL for the Yii2 backend. Adjust via Vite env var at build time.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/**
 * The access token is intentionally kept only in memory (module-level
 * variable), never in localStorage/sessionStorage. It is lost on full page
 * reload by design; a production token-refresh strategy will be addressed
 * separately.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth && accessToken) {
    finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorBody = body as Partial<LoginValidationErrorResponse> & { message?: string };
    throw new ApiError(
      errorBody?.message ?? "Request failed",
      response.status,
      errorBody?.errors
    );
  }

  return body as T;
}

export const authApi = {
  login(payload: LoginRequest): Promise<LoginSuccessResponse> {
    return request<LoginSuccessResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },
};
