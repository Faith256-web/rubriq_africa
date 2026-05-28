import { z } from "zod";
import { BACKEND_URL } from "./api";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(9, "Phone number too short").max(20),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  method: z.enum(["email", "sms"]).default("email"),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
  adminCode: z.string().optional(),
});

export type Role = "user" | "admin" | "superadmin";

export type Session = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  is_admin: boolean;
};

const SESSION_KEY = "rubriq.session.v1";
const TOKEN_KEY = "rubriq.token.v1";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function logout() {
  // Optional: Notify backend to blacklist token
  const token = getToken();
  if (token) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }).catch(err => console.error("Logout request failed:", err));
  }
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Initiates the signup process by requesting an OTP.
 */
export async function registerRequest(input: z.infer<typeof registerSchema>): Promise<{
  message: string;
  otp_code?: number;
  email: string;
  phone: string;
}> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      method: input.method,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration request failed.");
  }
  return data;
}

/**
 * Completes the signup process by verifying the OTP.
 */
export async function registerVerify(email: string, otpCode: string): Promise<Session> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code: otpCode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Verification failed.");
  }

  // Save credentials on success
  localStorage.setItem(TOKEN_KEY, data.access_token);
  const session: Session = {
    id: String(data.user.id),
    name: data.user.name,
    email: data.user.email,
    phone: data.user.phone,
    role: data.user.role,
    is_admin: data.user.is_admin,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Log in a user.
 */
export async function login(input: z.infer<typeof loginSchema>): Promise<Session> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      admin_code: input.adminCode || undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed.");
  }

  // Save credentials on success
  localStorage.setItem(TOKEN_KEY, data.access_token);
  const session: Session = {
    id: String(data.user.id),
    name: data.user.name,
    email: data.user.email,
    phone: data.user.phone,
    role: data.user.role,
    is_admin: data.user.is_admin,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
