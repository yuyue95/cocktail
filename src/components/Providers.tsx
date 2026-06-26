"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

// App-wide client providers: auth session context + toast portal.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-center" richColors />
    </SessionProvider>
  );
}
