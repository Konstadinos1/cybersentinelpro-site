import Link from "next/link";
import { fontVariables } from "@/fonts";

/** Outside the locale tree, so it carries both languages, French first. */
export default function NotFound() {
  return (
    <html lang="fr-CA" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center bg-night px-5 text-frost antialiased">
        <main className="max-w-md space-y-6 text-center">
          <p className="hud-text text-mist">404</p>
          <h1 className="text-3xl font-semibold">Page introuvable</h1>
          <p className="text-mist">Cette adresse n&apos;existe pas ou a changé.</p>
          <p className="text-mist" lang="en-CA">This address does not exist or has moved.</p>
          <div className="flex justify-center gap-3">
            <Link href="/fr" className="btn-primary">Accueil</Link>
            <Link href="/en" className="btn-secondary" lang="en-CA">Home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
