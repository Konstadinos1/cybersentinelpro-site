import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
/**
 * Vercel injects its comments toolbar on preview deployments only. These hosts come from
 * Vercel's toolbar CSP guidance and are never added to production builds.
 */
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const toolbar = (hosts: string) => (isVercelPreview ? ` ${hosts}` : "");

/** Third parties allowed after consent: Plausible or Vercel analytics, Cal.com on click. */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io${isDev ? " 'unsafe-eval'" : ""}${toolbar("https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${toolbar("https://vercel.live")}`,
  `img-src 'self' data: blob:${toolbar("https://vercel.live https://vercel.com")}`,
  `font-src 'self'${toolbar("https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self' https://plausible.io${toolbar("https://vercel.live wss://ws-us3.pusher.com")}`,
  `frame-src https://cal.com https://app.cal.com${toolbar("https://vercel.live")}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
