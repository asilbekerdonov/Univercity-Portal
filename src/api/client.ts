import type {
LoginRequest,
LoginSuccessResponse,
LoginValidationErrorResponse,
Faculty,
Student,
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

export const facultyApi = {
getAll(): Promise<Faculty[]> {
  return request<Faculty[]>("/v1/faculties", {
    method: "GET",
  });
},
getOne(id: number | string): Promise<Faculty> {
  return request<Faculty>(`/v1/faculties/${id}`, {
    method: "GET",
  });
},
create(payload: { name: string; slug: string; description?: string }): Promise<Faculty> {
  return request<Faculty>("/v1/faculties", {
    method: "POST",
    body: JSON.stringify(payload),
  });
},
delete(id: number): Promise<void> {
  return request<void>(`/v1/faculties/${id}`, {
    method: "DELETE",
  });
},
getStudents(facultyId: number | string): Promise<Student[]> {
  return request<Student[]>(`/v1/faculties/${facultyId}/students`, {
    method: "GET",
  });
},
createStudent(
  facultyId: number | string,
  payload: { name: string; age: number; course: number }
): Promise<Student> {
  return request<Student>(`/v1/faculties/${facultyId}/students`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
},
deleteStudent(id: number): Promise<void> {
  return request<void>(`/v1/students/${id}`, {
    method: "DELETE",
  });
},

};
// src/api/client.ts (добавить в конец файла)

export interface SendEmailRequest {
to: string;
subject: string;
body: string;
is_html?: boolean;
}

export interface SendEmailResponse {
success: boolean;
message_id: string;
status: string;
message: string;
}

export interface EmailStatusResponse {
id: number;
status: string;
to: string;
subject: string;
created_at: string;
sent_at?: string;
}

export const emailApi = {
/**
 * Отправка email через Email Service
 */
send(payload: SendEmailRequest): Promise<SendEmailResponse> {
  return request<SendEmailResponse>("/v1/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false, // можно сделать публичным или с auth
  });
},

/**
 * Проверка статуса email
 */
getStatus(id: number): Promise<EmailStatusResponse> {
  return request<EmailStatusResponse>(`/v1/email/status/${id}`, {
    method: "GET",
    auth: false,
  });
},

/**
 * Health check email сервиса
 */
health(): Promise<{ status: string; service: string; timestamp: string }> {
  return request("/v1/email/health", {
    method: "GET",
    auth: false,
  });
},
};