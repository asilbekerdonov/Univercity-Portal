export type UserRole = "super_admin" | "supervisor" | "worker";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  access_token: string;
  user: AuthUser;
}

export interface LoginValidationErrorResponse {
  errors: Record<string, string[]>;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  supervisor: "Supervisor",
  worker: "Worker",
};

export interface Faculty {
  id: number;
  name: string;
  description?: string;
}
