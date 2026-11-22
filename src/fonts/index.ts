import localFont from "next/font/local";

/**
 * Self-hosted at build time from the @fontsource-variable packages (latin subset covers
 * French accents). No runtime request reaches Google.
 */
export const displayFont = localFont({
  src: "./SpaceGrotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

export const bodyFont = localFont({
  src: "./Inter.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const monoFont = localFont({
  src: "./JetBrainsMono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
  preload: false,
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`;
