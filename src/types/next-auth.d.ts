import "next-auth";

// Augment NextAuth types so session.user carries our custom fields.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: string;
      mode: string;
    };
  }
  interface User {
    role?: string;
    mode?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    mode: string;
  }
}
