import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Convenience wrappers around getServerSession for use in API routes and
// server components.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

// Returns the user only when they are an admin; otherwise null.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
