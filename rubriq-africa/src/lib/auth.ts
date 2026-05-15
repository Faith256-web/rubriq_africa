// Mock auth using localStorage — no real backend yet.
// Replace with /api/auth/register, /api/auth/login, /api/auth/logout calls
// (bcryptjs hashing + JWT in httpOnly cookies + Zod validation) when backend is added.
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export type Role = "superadmin" | "user";
export type StoredUser = { name: string; email: string; password: string; role: Role };
export type Session = { name: string; email: string; role: Role };

const USERS_KEY = "rubriq.users.v1";
const SESSION_KEY = "rubriq.session.v1";

const readUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};
const writeUsers = (u: StoredUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

// NOTE: This is browser-side mock storage. Real backend MUST hash with bcryptjs server-side.
export function register(input: z.infer<typeof registerSchema>): Session {
  const data = registerSchema.parse(input);
  const users = readUsers();
  if (users.some(u => u.email === data.email)) throw new Error("An account with that email already exists.");
  // First user becomes superadmin (per spec).
  const role: Role = users.length === 0 ? "superadmin" : "user";
  const user: StoredUser = { ...data, role };
  writeUsers([...users, user]);
  const session: Session = { name: user.name, email: user.email, role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function login(input: z.infer<typeof loginSchema>): Session {
  const data = loginSchema.parse(input);
  const users = readUsers();
  const found = users.find(u => u.email === data.email && u.password === data.password);
  if (!found) throw new Error("Invalid email or password.");
  const session: Session = { name: found.name, email: found.email, role: found.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() { localStorage.removeItem(SESSION_KEY); }

export function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
