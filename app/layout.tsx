import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root shell with no locale logic. `<html lang>` is set by `app/[locale]/layout.tsx`, the
 * only place that knows the language; this file exists because `not-found.tsx` needs it.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
